import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadedMedia, UserData } from 'src/common/interfaces/all-interfaces';
import { PackageDto, UpdatePackageDto } from './dto/package-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { Repository } from 'typeorm';
import {  paginate,Paginated , PaginateQuery, FilterOperator} from 'nestjs-paginate';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteApiResponse, UploadApiResponse } from 'cloudinary';
import { PackageMedia } from './entity/package-media.entity';
@Injectable()
export class PackageService {

    constructor(@InjectRepository(Package) private  userPackage: Repository<Package>,
    @InjectRepository(PackageMedia) private packageMedia: Repository<PackageMedia>,
    private cloudinaryService: CloudinaryService) {}

    async create(dto: PackageDto,userData: UserData) {
        const newPackage=  this.userPackage.create({
            title: dto.title,
            description: dto.description,
            destination: dto.destination,
            price: dto.price,
            duration: dto.duration,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            userId: userData.id
        })

        await this.userPackage.save(newPackage)

        return {
            success: true,
            message: 'Package created successfully',
            data: newPackage
        }
    }
    async uploadFiles(packageId: string,files: Express.Multer.File[]) {
      
        if(!files || !files.length) {
            throw new BadRequestException('Nothing to update')
        }

      let uploadedFiles: PackageMedia[]= []
      for(const file of files) {
        const result= await this.cloudinaryService.uploadFile(file,'packages') as UploadApiResponse

        const packageMedia=  this.packageMedia.create({
            fileUrl: result.secure_url,
            fileType: result.resource_type,
            public_id: result.public_id,
            packageId
        })

        uploadedFiles.push(packageMedia)
      } 

      const savedFiles= await this.packageMedia.save(uploadedFiles)
      return {
            success: true,
            message: 'Files uploaded successfully',
            files: savedFiles,
      };
    }
  
    
    async getAll(query: PaginateQuery) {
        const packages= await paginate(query,this.userPackage,{
            sortableColumns: ['createdAt','updatedAt','startDate','endDate','price','duration','title'],
            searchableColumns: ['title','description','destination'],
            filterableColumns: {
                price: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE,FilterOperator.BTW],
                duration: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE,FilterOperator.BTW],
                startDate: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE,FilterOperator.BTW],
                endDate: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE,FilterOperator.BTW],
                userId: [FilterOperator.EQ],
            },
            defaultSortBy: [['createdAt','DESC']],
            relations: ['files'],
            defaultLimit: 10,
            maxLimit: 100,
        })
        return {
            success: true,
            data: packages.data,
            meta: packages.meta
        }
    }

    async getOne(id: string) {
        const onePackage= await this.userPackage.findOneOrFail({where: {id},relations: ['files']})
        return {
            success: true,
            data: onePackage
        }
    }

    async updateOne(id: string,dto: UpdatePackageDto,userData: UserData) {
        
        if(!Object.values(dto).some(value => value !== undefined && value !== null)) {
            throw new BadRequestException('Nothing to update')
        }
        const existingPackage= await this.userPackage.findOneOrFail({where: {id}})

        Object.keys(dto).forEach((key) => {
            if(dto[key] !== undefined) {
                if(key === 'startDate' || key === 'endDate'){
                    existingPackage[key]= new Date(dto[key])
                } else {
                    existingPackage[key]= dto[key]
                }
            }
        })

        await this.userPackage.save(existingPackage)

        return {
            success: true,
            message: 'Package updated successfully',
            data: existingPackage
        }
    }

    async deleteFiles(mediaId: string,userData: UserData) {
      
        const media= await this.packageMedia.findOneOrFail({where: {id: mediaId},
            relations: ['package'],
        })

        if(userData.role !== 'ADMIN' && media.package.userId !== userData.id) {
            throw new BadRequestException('You cant delete this media')
        }

        await Promise.all([
            this.cloudinaryService.deleteFile(media.public_id,media.fileType),
            this.packageMedia.delete({id: mediaId})
        ])

        return {
            success: true,
            message: 'Media deleted successfully'
        }
    
    }
    async deleteOne(id: string, userData: UserData) {
        const existingPackage= await this.userPackage.findOneOrFail({where: {id},relations: ['files']})
        
         
        if(existingPackage.files.length > 0) {
            for (const file of existingPackage.files) {
                if(!file.public_id) {
                    continue;
                }
                const result= await this.cloudinaryService.deleteFile(file.public_id,file.fileType)
            }
        }
        await this.userPackage.delete({id})

        return {
            success: true,
            message: 'Package deleted successfully'
        }

    }
}



 