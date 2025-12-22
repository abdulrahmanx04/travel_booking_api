import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, RefundPaymentDto } from './dto/payment-dto';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Paginate} from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/')
  createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() userData: UserData) {
    return this.paymentService.createPayment(dto,userData)
  }

  @Get('/:id')
  getOne(@Param('id') id: string,@CurrentUser() userData: UserData) {
    return this.paymentService.getPaymentById(id,userData)
  }

  @Get('booking/:bookingId')
  getBookingPayments(@Param('bookingId') bookingId: string,@Paginate() query: PaginateQuery ,@CurrentUser() userData: UserData) {
     return this.paymentService.getBookingPayments(bookingId, query,userData);
  }
  
  @Get('/')
  getUserPayments(@Paginate() query: PaginateQuery ,@CurrentUser() userData: UserData) {
    return this.paymentService.getUserPayments(query,userData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('/refund/:id')
  refundPayment(@Param('id') id: string,@Body() dto: RefundPaymentDto,
  @CurrentUser() userData: UserData) {
    return this.paymentService.refundPayment(id,dto,userData)
  }

 
  @Post('/cancel/:id')
  cancelPayment(@Param('id') id: string,@CurrentUser() userData: UserData){
    return this.paymentService.cancelPayment(id,userData)
  } 

}
