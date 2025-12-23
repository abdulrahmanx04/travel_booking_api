import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageDto, UpdatePackageDto } from './dto/package-dto';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { PaginateQuery } from 'nestjs-paginate';
import { Paginate } from 'nestjs-paginate';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Post('/')
  create(@Body() dto : PackageDto,@CurrentUser() userData: UserData){
    return this.packageService.create(dto,userData)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('files',5))
  @Post('/files/:id')
  uploadFiles(@Param('id') id: string, @CurrentUser() userData: UserData,
  @UploadedFiles() files: Express.Multer.File[]) {
    return this.packageService.uploadFiles(id,files)
  }

  @Get('')
  getAll(@Paginate() query: PaginateQuery) {
    return this.packageService.getAll(query)
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.packageService.getOne(id)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Put('/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto, @CurrentUser() userData: UserData) {
    return this.packageService.updateOne(id,dto,userData)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Delete('/:id')
  deleteOne(@Param('id') id: string,@CurrentUser() userData: UserData) {
    return this.packageService.deleteOne(id,userData)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Delete('/files/:id')
  deleteFiles(@Param('id') id: string,@CurrentUser() userData: UserData) {
    return this.packageService.deleteFiles(id,userData)
  }
}
