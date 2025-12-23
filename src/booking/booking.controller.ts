import { Controller, Post,Get,Put,Delete,Body, UseGuards, Param, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookDto, UpdateBookingDto } from './dto/booking-dto';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { Throttle } from '@nestjs/throttler';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('/')
  create(@Body() dto: CreateBookDto, @CurrentUser() userData: UserData) {
    return this.bookingService.create(dto,userData)
  }

  @Get('')
  getAll(@Paginate() query: PaginateQuery, @CurrentUser() userData: UserData) {
    return this.bookingService.getAll(query,userData)
  }



  @Get('/:id')
  getOne(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.bookingService.getOne(id,userData)
  }

  @Put('/:id')
  updateOne(@Param('id') id: string, @Body() dto: UpdateBookingDto, @CurrentUser() userData: UserData) {
    return this.bookingService.updateOne(id,dto,userData)
  }

  @Delete('/:id')
  deleteOne(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.bookingService.deleteOne(id,userData)
  }

}
