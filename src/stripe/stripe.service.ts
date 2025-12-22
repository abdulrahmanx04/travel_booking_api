import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CheckoutData, RefundData } from '../common/interfaces/all-interfaces';
import Stripe from 'stripe'


@Injectable()
export class StripeService {
    private stripe: Stripe
    private webhookSecret: string

    constructor(private readonly configService: ConfigService) {
        this.stripe= new Stripe(this.configService.getOrThrow("STRIPE_SECRET_KEY"), {
            apiVersion: '2025-11-17.clover'
        })
        this.webhookSecret= this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')
    }

    async createCheckoutSession(params: CheckoutData) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    price_data: {
                        currency: params.currency.toLowerCase(),
                        product_data: {
                            name: 'Booking Payment',
                            description: `Payment for bookingId #${params.bookingId}`
                        },
                        unit_amount: Math.round(params.amount * 100)
                    },
                    quantity: 1
                  }
                ],
                mode: 'payment',
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
                customer_email: params.customerEmail,
                metadata: {
                    bookingId: params.bookingId
                }
            })
            return session
        }catch(err){
            console.error('Stripe session creation error:', err);
            throw new InternalServerErrorException(`Error creating session: ${err.message}`)
        }
    }

  
    async retrieveCheckoutSession(sessionId: string) {
        try {
            return await this.stripe.checkout.sessions.retrieve(sessionId)
        }catch(err) {
            throw new InternalServerErrorException('Failed to retrieve payment intent')
        }
    }
    
    async expireCheckoutSession(sessionId: string) {
        try {
            return await this.stripe.checkout.sessions.expire(sessionId);
        } catch (error) {
            throw new InternalServerErrorException('Failed to expire checkout session');
        }
    }

    async refundPayment(params: RefundData) {
        try {
            return await this.stripe.refunds.create({
                payment_intent: params.paymentIntentId,
                amount: params.amount ? Math.round(params.amount * 100) : undefined,
                reason: params.reason as any 
            })
        }catch(err){
            throw new InternalServerErrorException('Failed to refund payment');
        }
    }

    constructWebhook(payload: Buffer,signature: string) {
       try {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            this.webhookSecret
        )
        } catch (error) {
            throw new BadRequestException('Invalid webhook signature');
        }
    }

}
