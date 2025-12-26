import { Module } from '@nestjs/common';
import { AdminBookingService } from './booking/admin-booking.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { Payments } from 'src/payment/entities/payment-entity';
import { Package } from 'src/package/entity/package.entity';
import { AdminUserService } from './users/admin-users.service';
import { AdminPaymentService } from './payments/admin-payments.service';
import { AdminDashboardService } from './dashbord/admin-dashbord.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,Booking,Payments,Package])],
  controllers: [AdminController],
  providers: [AdminBookingService,AdminUserService,AdminPaymentService,AdminDashboardService],
})
export class AdminModule {}
