import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { Booking } from 'src/booking/entities/booking.entity';
import { UserData } from 'src/common/interfaces/all-interfaces';
import { Repository } from 'typeorm';
import { AdminBookingDto } from './admin-booking-dto';
import { PaymentStatus } from 'src/payment/entities/payment-entity';

@Injectable()
export class AdminBookingService {

    constructor(@InjectRepository(Booking) private bookingRepository: Repository<Booking>) {}

    async getAll(query: PaginateQuery,userData: UserData) {

        const queryBuilder= this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.package', 'pkg')
            .leftJoin('booking.user','user')
            .addSelect(['user.name','user.email','user.avatar'])

        const bookings= await paginate(query,queryBuilder,{
            sortableColumns: ['createdAt','customerName','guestCount','price','status'],
            searchableColumns: ['customerName','destination'],
            filterableColumns: {
                status: [FilterOperator.EQ],
                price: [FilterOperator.BTW, FilterOperator.GTE, FilterOperator.LTE],
                guestCount: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE],
            },
            defaultLimit: 10,
            maxLimit: 100,
            defaultSortBy: [['createdAt','DESC']],
        })

        return {
            success: true,
            data: bookings.data,
            meta: bookings.meta
        }
    }

    async getOne(id: string, userData: UserData) {
        const booking= await this.bookingRepository.findOneOrFail({where: {
            id
        }, 
        relations: ['package','user'],
        select: {
            user: {
                name: true,
                email: true,
                avatar: true
            },
            package: {
                title: true,
                price: true,
            },
        }
    })
        return {
            success: true,
            data: booking
        }
    }

    async updateOne(id: string, dto: AdminBookingDto,userData: UserData) {

        if(!Object.values(dto).some(val => val !== undefined && val !== null)) {
            throw new BadRequestException('Nothing to update')
        }

        const booking: Booking= await this.bookingRepository.findOneOrFail({
            where: {
                id
            },
            relations: ['package','user'],
            select: {
                user: {
                    name: true,
                    email: true,
                    avatar: true
                },
                package: {
                    title: true,
                    price: true,
                },
            }
        })

        const hasPaid= booking.payments?.some(p => p.status === PaymentStatus.SUCCEEDED)

        if(hasPaid && dto.status) {
            throw new BadRequestException('Cannot change booking status after payment')
        }
        
        this.bookingRepository.merge(booking,dto)

        await this.bookingRepository.save(booking)

        return {
            success: true,
            data: booking
        }
    }

}
