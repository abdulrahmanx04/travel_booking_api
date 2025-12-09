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
        entities: [User,Package,PackageMedia,Booking],
        synchronize: true,
      }),AuthModule, UserModule, PackageModule, BookingModule, CloudinaryModule],
  providers: [],
})
export class AppModule {}
