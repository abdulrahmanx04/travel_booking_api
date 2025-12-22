import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payments } from './entities/payment-entity';
import { StripeModule } from 'src/stripe/stripe.module';
import { Booking } from 'src/booking/entities/booking.entity';
import { WebhookController } from './payment.webhook.controller';

@Module({
  imports:[ TypeOrmModule.forFeature([Payments,Booking]), StripeModule],
  controllers: [PaymentController,WebhookController],
  providers: [PaymentService],
})
export class PaymentModule {}
