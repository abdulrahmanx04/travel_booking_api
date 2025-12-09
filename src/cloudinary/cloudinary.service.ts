import { Injectable,BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

@Injectable()
export class CloudinaryService {
    
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];

    private readonly allowedExtensions= ['.jpg','.jpeg','.png','.pdf']

    private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024  
    private readonly MAX_FILE_SIZE= 100 * 1024 * 1024


    async uploadFile(file: Express.Multer.File, folder: string) {
        if(!file) {
            throw new BadRequestException('No file uploaded')
        }

        if(!file.buffer || file.size === 0) {
            throw new BadRequestException('File is empty')
        }
        
        const maxSize= file.mimetype === 'application/pdf'
        ? this.MAX_FILE_SIZE
        : this.MAX_IMAGE_SIZE

        if(file.size > maxSize) {
            throw new BadRequestException(`File size cannot exceed ${maxSize/(1024*1024)}MB`)
        }
        
        if(!this.allowedMimeTypes.includes(file.mimetype)) {
             throw new BadRequestException(`Invalid mimetype, allowed mimetypes: ${this.allowedMimeTypes.join(', ')}`)
        }

        const extName= path.extname(file.originalname).toLowerCase()

        if(!this.allowedExtensions.includes(extName)) {
            throw new BadRequestException(`Invalid ext type, allowed extensions: ${this.allowedExtensions.join(', ')}`)
        }

        let resource_type: 'image' | 'raw' = file.mimetype === 'application/pdf' ? 'raw' : 'image'
        return await new Promise((resolve,reject) => {
            cloudinary.uploader.upload_stream({folder,resource_type},(err,result) => {
                if(err) return reject(err)
                return resolve(result)    
            }).end(file.buffer)
        })
    }

    async deleteFile(publid_id: string, resource_type: string) {
        
        const result= await cloudinary.uploader.destroy(publid_id,{resource_type})
        if(result.result !== 'ok') {
            throw new BadRequestException('File delete failed')
        }
    }

}