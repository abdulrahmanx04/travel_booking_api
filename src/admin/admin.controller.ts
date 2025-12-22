import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AdminBookingService } from './booking/admin-booking.service';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { AdminBookingDto } from './booking/admin-booking-dto';
import { AdminUserService } from './users/admin-users.service';
import { AdminUpdateUserDto } from './users/admin-users.dto';
import { AdminPaymentService } from './payments/admin-payments.service';

@Controller('admin')
@Roles('admin')
@UseGuards(JwtAuthGuard,RolesGuard)
export class AdminController {
  constructor(private readonly adminBookingService: AdminBookingService,
    private readonly adminUserService: AdminUserService,
    private readonly adminPaymentService: AdminPaymentService
  ) {}

  @Get('/bookings')
  async getAllBookings(@Paginate() query: PaginateQuery, @CurrentUser() userData: UserData) {
    return this.adminBookingService.getAll(query,userData)
  }

  @Get('/bookings/:id')
  async getOneBooking(@Param('id') id: string,@CurrentUser() userData: UserData) {
    
    return this.adminBookingService.getOne(id,userData)
  }

  @Put('/bookings/:id')
  async updateBooking(@Param('id') id: string, @Body() dto: AdminBookingDto, @CurrentUser() userData: UserData) {
    return this.adminBookingService.updateOne(id,dto,userData)
  }

  @Get('/users')
  async getAllUsers(@Paginate() query: PaginateQuery) {
    return this.adminUserService.getAll(query)
  }

  @Get('/users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminUserService.getOne(id)
  }

  @Put('/users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminUserService.updateOne(id,dto)
  }

  @Get('/payments')
  async getAllPayments(@Paginate() query: PaginateQuery) {
    return this.adminPaymentService.getAll(query)
  }

  @Get('/payments/:id')
  async getOnePayment(@Param('id') id: string) {
    return this.adminPaymentService.getOne(id)
  }

}
