import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/auth/entities/user.entity";
import { Booking } from "src/booking/entities/booking.entity";
import { Payments, PaymentStatus } from "src/payment/entities/payment-entity";
import { Repository } from "typeorm";



@Injectable()
export class AdminDashboardService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Payments) private paymentRepo: Repository<Payments>
) {}

    async getStats() {
        const [users,bookings,payments,revenue]= await Promise.all([
            this.userRepo.count(),
            this.bookingRepo.count(),
            this.paymentRepo.count(),
            this.paymentRepo
                .createQueryBuilder('p')
                .select('COALESCE(SUM(p.amount), 0)', 'total')
                .where('p.status= :status', {status: PaymentStatus.SUCCEEDED})
                .getRawOne()
        ])
        // COALESCE(SUM(p.amount), 0, 'total)
          return {
            success: true,
            users,
            bookings,
            payments,
            revenue: Number(revenue.total),
        };
    }



}
