import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { PackageMedia } from './entity/package-media.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Package,PackageMedia]), CloudinaryModule],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}
