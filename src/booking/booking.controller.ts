import { Controller, Post,Get,Put,Delete,Body, UseGuards, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookDto, UpdateBookingDto } from './dto/booking-dto';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() dto: CreateBookDto, @CurrentUser() userData: UserData) {
    return this.bookingService.create(dto,userData)
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getAll(@Paginate() query: PaginateQuery, @CurrentUser() userData: UserData) {
    return this.bookingService.getAll(query,userData)
  }



  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getOne(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.bookingService.getOne(id,userData)
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  updateOne(@Param('id') id: string, @Body() dto: UpdateBookingDto, @CurrentUser() userData: UserData) {
    return this.bookingService.updateOne(id,dto,userData)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  deleteOne(@Param('id') id: string, @CurrentUser() userData: UserData) {
    return this.bookingService.deleteOne(id,userData)
  }


}
