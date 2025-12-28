import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PackageModule } from './package/package.module';
import { BookingModule } from './booking/booking.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { Booking } from './booking/entities/booking.entity';
import { Package } from './package/entity/package.entity';
import { ConfigModule } from '@nestjs/config';
import { PackageMedia } from './package/entity/package-media.entity';
import { PaymentModule } from './payment/payment.module';
import { Payments } from './payment/entities/payment-entity';
import { StripeModule } from './stripe/stripe.module';
import { AdminModule } from './admin/admin.module';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ 
      ConfigModule.forRoot({isGlobal: true}),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER,  
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
        entities: [User,Package,PackageMedia,Booking,Payments],
        synchronize: false,
      }),
      ThrottlerModule.forRoot([
        {
          ttl: 60000,
          limit: 100
        }
      ])
      ,AuthModule, UserModule, PackageModule, BookingModule, CloudinaryModule, PaymentModule, StripeModule, AdminModule],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
})
export class AppModule {}
