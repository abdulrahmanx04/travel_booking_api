import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FilterOperator, paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Payments } from "src/payment/entities/payment-entity";
import { Repository } from "typeorm";









@Injectable()
export class AdminPaymentService {
    constructor(@InjectRepository(Payments) private paymentRepository: Repository<Payments>) {}

   async getAll(query: PaginateQuery) {
        const payments= await paginate(query,this.paymentRepository, {
          relations: {
            user: true,
            booking: {
                package: true
            }
          },
          sortableColumns: ['id','status','createdAt','amount'],
          searchableColumns: ['user.email','user.name','status','booking.destination','booking.package.title'],
          filterableColumns: {
            amount: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
            status: [FilterOperator.EQ],
            currency: [FilterOperator.EQ],
            'user.name': [FilterOperator.ILIKE, FilterOperator.CONTAINS],
          },
          defaultLimit: 10,
          maxLimit: 100,
          defaultSortBy: [['createdAt', 'DESC']],
          select: [
            'id',
            'status',
            'amount',
            'currency',
            'createdAt',
            'user.id',
            'user.email',
            'user.name',
            'booking.destination',
            'booking.package.title'
          ]
        })
        return {
            success: true,
            data: payments.data,
            meta: payments.meta
        }
   }

   async getOne(id: string) {
    const payment= await this.paymentRepository.findOneOrFail({
        where: {
            id
        },
        relations: ['user','booking']
    })
    return {
        success: true,
        data: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            method: payment.paymentMethod,
            destination: payment.booking.destination,
            customerName: payment.booking.customerName,
            customerEmail: payment.user.email
        }
    }
   }
}