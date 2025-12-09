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
           
        if(userData.role !== 'ADMIN') {
            queryBuilder.andWhere('booking.userId= :userId', {userId: userData.id})
        }

        if(query.search) {
            queryBuilder.andWhere(
                'booking.customerName ILIKE :search OR booking.destination ILIKE :search OR pkg.title ILIKE :search',
                {search: `%${query.search}%`}
            )
        }
        
        const bookings= await paginate(query,queryBuilder,
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
                defaultLimit: 20,
                maxLimit: 100
            }
        )
        return {
            success: true,
            data: bookings.data,
            meta: {
                page: bookings.meta.currentPage,
                limit: bookings.meta.itemsPerPage,
                total: bookings.meta.totalItems,
                totalPages: bookings.meta.totalPages
            }
        }
        
    }

    async getOne(id: string, userData: UserData) {
        const query= await this.booking
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.package','pkg')
            .leftJoin('booking.user','user')
            .addSelect(['user.id', 'user.name','user.avatar'])
        
        if(userData.role === 'ADMIN') {
            query.where('booking.id= :id', {id})
        }  else {
             query.where('booking.id= :id AND booking.userId= :userId', {id,userId: userData.id})
        }

        const book= await query.getOneOrFail()

        return {
            success: true,
            data: book
        }
    }

    async updateOne(id: string, dto: UpdateBookingDto, userData: UserData) {
        const query= this.booking
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.package','pkg')
            .leftJoin('booking.user', 'user')
            .addSelect(['user.name','user.avatar'])


        if(userData.role !== 'ADMIN') {
            delete dto.packageId
            delete dto.price
            delete dto.status
            query.andWhere('booking.id= :id AND booking.userId= :userId',{id,userId: userData.id})
        } else {
            query.andWhere('booking.id= :id', {id})
        }

        const booking= await query.getOneOrFail()

        if(dto.packageId) {
            const pkg= await this.pkg.findOneOrFail({where: {id: dto.packageId}})
            booking.package=pkg
            booking.packageId = pkg.id;
        }

        const {packageId, ...otherFields} = dto

        Object.assign(booking,otherFields)

        await this.booking.save(booking);

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

        if(userData.role !== 'ADMIN') {
            if(booking.status !== 'pending') {
                throw new BadRequestException('Only pending bookings can be deleted')
            }
        }

        await this.booking.delete({id})

        return {
            success: true,
            message: 'Book deleted successfully'
        }
    }
}
