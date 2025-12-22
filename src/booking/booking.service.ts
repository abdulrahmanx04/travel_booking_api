import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateBookDto, UpdateBookingDto } from './dto/booking-dto';
import { UserData } from 'src/common/interfaces/all-interfaces';
import { Package } from 'src/package/entity/package.entity';
import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';

@Injectable()
export class BookingService {
    constructor(@InjectRepository(Booking) private booking: Repository<Booking>,
    @InjectRepository(User) private user : Repository<User>,
    @InjectRepository(Package) private pkg: Repository<Package>,
    private dataSource: DataSource) {}

    async create(dto: CreateBookDto, userData: UserData) {
        const bookingResult= await this.dataSource.transaction(async(manager) => {
            const [user,pkg]= await Promise.all([
                manager.getRepository(User).findOneOrFail({where: {id: userData.id}}),
                manager.getRepository(Package).findOneOrFail({where: {id: dto.packageId}})
            ])

            const booking= manager.getRepository(Booking).create({
                userId: user.id,
                package: pkg,
                price: pkg.price,
                guestCount: dto.guestCount,
                customerName: dto.customerName,
                destination: dto.destination,
                travelDate: new Date(dto.travelDate),
            })
            await manager.getRepository(Booking).save(booking)

            return booking
        })

        return {
            success: true,
            message: 'Booking created successfully',
            data: bookingResult
        }
    }
    async getAll(query: PaginateQuery, userData: UserData) {
      
        const queryBuilder=  this.booking
           .createQueryBuilder('booking')
           .leftJoinAndSelect('booking.package','pkg')
           .leftJoin('booking.user','user')
           .addSelect(['user.name','user.avatar','user.email'])
           .where('booking.userId= :userId', {userId: userData.id})
        if(query.search) {
            queryBuilder.andWhere(
                'booking.customerName ILIKE :search OR booking.destination ILIKE :search OR pkg.title ILIKE :search',
                {search: `%${query.search}%`}
            )
        }
        const booking= await paginate(query,queryBuilder,
            {
                sortableColumns: ['createdAt','price','status','destination','travelDate'],
                defaultSortBy: [['createdAt', 'DESC']],
                filterableColumns: {
                    price: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
                    status: [FilterOperator.EQ],
                    travelDate: [FilterOperator.GTE, FilterOperator.LTE],
                    packageId: [FilterOperator.EQ],
                    userId: [FilterOperator.EQ],
                },
                defaultLimit: 10,
                maxLimit: 100
            }
        )
        return {
            success: true,
            data: booking.data,
            meta: booking.meta
        }
        
    }

    async getOne(id: string, userData: UserData) {
        const query= this.booking
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.package','pkg')
            .leftJoin('booking.user','user')
            .addSelect(['user.id', 'user.name','user.avatar'])
            .where('booking.userId= :userId AND booking.id= :id', {userId: userData.id, id})
        
        const book= await query.getOneOrFail()

        return {
            success: true,
            data: book
        }
    }

    async updateOne(id: string, dto: UpdateBookingDto, userData: UserData) {
        const booking= await this.booking.findOneOrFail({
            where: {
                id,
                userId: userData.id
            }
        })

        Object.assign(booking,dto)
        return {
            success: true,
            message: 'Booking updated successfully',
            data: booking
        }
    }
    
    async deleteOne(id: string, userData: UserData) {
        const booking= await this.booking.findOneOrFail({where: {id,
            ...(userData.role !== 'ADMIN' && {userId: userData.id})
        }})

        if(booking.status !== 'pending') {
                throw new BadRequestException('Only pending bookings can be deleted')
        }
        await this.booking.delete({id})

        return {
            success: true,
            message: 'Book deleted successfully'
        }
    }
}
