import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from '../auth/entities/user.entity';
import { Package } from '../package/entity/package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking,User,Package])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
