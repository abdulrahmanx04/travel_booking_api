import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, Payments, PaymentStatus } from './entities/payment-entity';
import { Repository } from 'typeorm';
import { StripeService } from 'src/stripe/stripe.service';
import { CreatePaymentDto, RefundPaymentDto } from './dto/payment-dto';
import {  UserData } from 'src/common/interfaces/all-interfaces';
import { Booking, BookingStatus } from 'src/booking/entities/booking.entity';
import Stripe from 'stripe';
import { paginate, PaginateQuery, FilterOperator, Paginate } from 'nestjs-paginate';
import { sendEmail } from '../common/utils/email';

@Injectable()
export class PaymentService {
    private stripe: Stripe
    constructor(@InjectRepository(Payments) private paymentRepository: Repository<Payments>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    private readonly stripeService: StripeService,
){


} 

    async createPayment(dto: CreatePaymentDto, userData: UserData) {
        const {currency= 'EGP',bookingId}= dto

        const booking= await this.bookingRepository.findOneOrFail({
            where :{
                id: bookingId,
                userId: userData.id,
                
            },
            relations: ['user']
        })
        
        if(booking.status !== 'pending') {
            throw new BadGatewayException('Booking is not pending')
        }

        const pricePerGuest= booking.price as number
        const totalAmount= pricePerGuest * booking.guestCount as number

        const session= await this.stripeService.createCheckoutSession({
            bookingId,
            currency,
            amount: totalAmount,
            successUrl: `${process.env.FRONTEND_URL}/bookings/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.FRONTEND_URL}/bookings/${bookingId}/cancel`,
            customerEmail:  booking.user.email
        })

        const payment=  this.paymentRepository.create({
            bookingId,
            userId: userData.id,
            status: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.CARD,
            amount: totalAmount,
            currency,
            stripeSessionId: session.id,
            metadata: {
                bookingId,
                createdVia: 'web'
            }
        })
        await this.paymentRepository.save(payment)
        return {
            success: true,
            payment: {
                id: payment.id,
                amount: totalAmount,
                currency: payment.currency,
                status: payment.status,
                createdAt: payment.createdAt,
            },
            checkoutUrl: session.url, 
            sessionId: session.id,
        };
    }

    async confirmPayment(paymentIntentId: string) {
        const payment= await this.paymentRepository.findOneOrFail({
            where: {
                stripePaymentIntentId: paymentIntentId
            },
            relations: ['booking']
        })

        payment.status= PaymentStatus.SUCCEEDED
        payment.booking.status= BookingStatus.COMPLETED

        await  Promise.all([
            this.bookingRepository.save(payment.booking),
            this.paymentRepository.save(payment)
        ])
        return {
            success: true,
            message: 'Payment confirmed successfully',
            data: payment
        }
    }

    async getPaymentById(paymentId: string, user: UserData) {
        const payment= await this.paymentRepository.findOneOrFail({
            where: {
                id: paymentId,
                userId: user.id
            },
            relations: ['booking']
        })
        return {
            success: true,
            data: payment
        }
    }

    async getUserPayments(query: PaginateQuery,user: UserData) {
       const payments= await paginate(query,this.paymentRepository, {
            sortableColumns: ['amount','createdAt','updatedAt','currency','status'],
            searchableColumns: ['amount','status'],
            filterableColumns: {
            status: [FilterOperator.EQ],
            amount: [FilterOperator.EQ, FilterOperator.BTW, FilterOperator.LT],
            currency: [FilterOperator.EQ],
            bookingId: [FilterOperator.EQ]
            },
            where: {userId: user.id},
            defaultSortBy: [['createdAt','DESC']],
            relations: ['booking'],
            defaultLimit: 10,
            maxLimit: 100
       })

       return {
            success: true,
            data: payments.data,
            meta: {
                page: payments.meta.currentPage,
                limit: payments.meta.itemsPerPage,
                total: payments.meta.totalItems,
                totalPages: payments.meta.totalPages,
            }
        }
    }

    async getBookingPayments(bookingId: string, query: PaginateQuery, userData: UserData) {
        const payments= await paginate(query,this.paymentRepository,{
            sortableColumns: ['amount','createdAt','updatedAt','currency','status'],
            searchableColumns: ['amount','status'],
            filterableColumns: {
                status: [FilterOperator.EQ],
                amount: [FilterOperator.EQ, FilterOperator.BTW, FilterOperator.LT],
                currency: [FilterOperator.EQ],
                bookingId: [FilterOperator.EQ]
            },
            where: {bookingId, userId: userData.id},
            relations: ['booking'],
            defaultLimit: 10,
            maxLimit: 100,
            defaultSortBy: [['createdAt','DESC']]
        })

        return {
            success: true,
            data: payments.data,
            meta: {
                page: payments.meta.currentPage,
                limit: payments.meta.itemsPerPage,
                total: payments.meta.totalItems,
                totalPages: payments.meta.totalPages,
            }
        }
    }

    async refundPayment(paymentId: string,dto: RefundPaymentDto,userData: UserData) {
        const payment= await this.paymentRepository.findOneOrFail({
            where: {
                id: paymentId,
                status: PaymentStatus.SUCCEEDED
            },
            relations: ['booking']
        })

        if(payment.refundAmount > 0) {
            throw new BadRequestException('Payment has already been refunded');
        }

        await this.stripeService.refundPayment({
            paymentIntentId: payment.stripePaymentIntentId,
            amount: dto.amount,
            reason: dto.reason
        })

        return {
            success: true,
            message: 'Refund done successfully',
        }
    }

    async cancelPayment(paymentId: string,userData: UserData) {
        const payment= await this.paymentRepository.findOneOrFail({
            where: {
                id: paymentId,
                userId: userData.id,
                status: PaymentStatus.PENDING
            },
            relations: ['booking']
        })

        await this.stripeService.expireCheckoutSession(payment.stripeSessionId)

        payment.status= PaymentStatus.CANCELLED
        payment.failureReason = 'Cancelled by user';
        await this.paymentRepository.save(payment);

        return {
            success: true,
            message: 'Payment cancelled successfully',
            data:{
                id: payment.id,
                status: PaymentStatus.CANCELLED,
                reason: payment.failureReason
            }
        }
    }

    async handleWebhookEvent(event: any) {
        
            switch(event.type) {

                case 'checkout.session.completed': {
                    const session= event.data.object
                    const payment= await this.paymentRepository.findOneOrFail({where: {
                        stripeSessionId: session.id
                    },relations: ['user','booking']})

                    payment.stripePaymentIntentId= session.payment_intent as string
                    payment.status= PaymentStatus.SUCCEEDED
                    payment.booking.status= BookingStatus.COMPLETED

                    await Promise.all([
                        this.paymentRepository.save(payment),
                        this.bookingRepository.save(payment.booking),
                        sendEmail('paymentSuccess', payment.user.email)
                    ]);
                    break;
                }
              
                case 'payment_intent.payment_failed': {
                    const paymentIntent= event.data.object
                    const payment= await this.paymentRepository.findOneOrFail({
                        where: {
                            stripePaymentIntentId: paymentIntent.id
                        },
                        relations: ['booking','user']
                    })

                    payment.status= PaymentStatus.FAILED
                    payment.failureReason= paymentIntent.last_payment_error?.message
                    await Promise.all([
                        this.paymentRepository.save(payment),
                        sendEmail('paymentFailed',payment.user.email)
                    ])
                    break 
                }
                case 'charge.refunded': {
                    const charge= event.data.object
                    const payment= await this.paymentRepository.findOneOrFail({
                        where: {
                            stripePaymentIntentId:  charge.payment_intent,
                        },
                        relations: ['booking','user']
                    })
                    
                        payment.refundedAt= new Date()
                        payment.status= PaymentStatus.REFUNDED
                        payment.refundAmount = Math.round(charge.amount_refunded / 100); 
                        payment.booking.status= BookingStatus.PENDING
                        await Promise.all([
                            this.bookingRepository.save(payment.booking),
                            this.paymentRepository.save(payment),
                            sendEmail('paymentRefunded',payment.user.email)
                        ])
                    break;
                }
                case 'checkout.session.expired': {
                    const session = event.data.object
                    const payment= await this.paymentRepository.findOneOrFail({
                        where: {
                            stripeSessionId: session.id,
                        },
                        relations: ['booking']
                    })
                    payment.status= PaymentStatus.FAILED
                    payment.failureReason = 'Checkout session expired or user cancelled the payment';
                    await this.paymentRepository.save(payment);
                    break
                }
        } 
    }
}
