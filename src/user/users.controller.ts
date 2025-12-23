import { Controller, Get, Put,Post,Delete, UseGuards,Body, UseInterceptors, UploadedFile,NotFoundException } from '@nestjs/common';
import { UserService } from './users.service';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { UpdateProfileDto } from './dto/profile-dto';
import { PasswordDto } from 'src/auth/dto/auth-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  findOne(@CurrentUser() userData: UserData) {
    return this.userService.findOne(userData)
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/me')
  updateOne(@Body() dto: UpdateProfileDto, @CurrentUser() userData: UserData,
  @UploadedFile() file?: Express.Multer.File) {
    return this.userService.updateOne(dto,userData,file)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  deleteOne(@Body() dto: PasswordDto, @CurrentUser() userData: UserData) {
    return this.userService.deleteOne(dto,userData)
  }


} 
