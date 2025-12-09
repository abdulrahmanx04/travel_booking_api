import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserData } from 'src/common/interfaces/all-interfaces';
import { UpdateProfileDto } from './dto/profile-dto';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { sendOtpEmail } from 'src/common/utils/email';
import { PasswordDto } from 'src/auth/dto/auth-dto';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User }from '../auth/entities/user.entity'
@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private user:  Repository<User>,
    private cloudinaryService: CloudinaryService
) {}

    async findOne(userData: UserData) {
        const user= await this.user.findOneOrFail({
            where: {
                id: userData.id
            },
            relations: ['bookings']
        })

        
        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                bookings: user.bookings
            }
        }
    }

    async updateOne(dto: UpdateProfileDto, userData: UserData, file?: Express.Multer.File) {
        const user= await this.user.findOneOrFail({where: {id: userData.id}})
        if(!dto.email && !dto.name && !file) {
            throw new BadRequestException('Nothing to update')
        }
        
        if(file) {
            try {
                let avatar= await this.cloudinaryService.uploadFile(file,'avatar') as UploadApiResponse
                user.avatar= avatar.secure_url
            }catch(err){
                throw new NotFoundException('Error uploading')
            }
        }  
        if(dto.email) {
            const exists= await this.user.findOneBy({email: dto.email})
            if(exists) {
                throw new BadRequestException('Email already used')
            }
            const otp= crypto.randomInt(0,10**6).toString().padStart(6,'0')
            await sendOtpEmail(dto.email,otp)
        }
        
        Object.keys(dto).forEach((key) => {
            if(key !== 'email' && dto[key] !== undefined) {
                user[key]= dto[key]
            }
        })
        
        await this.user.save(user)

        return {
            success: true,
            message: dto.email? 'OTP verification has been sent to your email'
            : 'Profile updated successfully'
        }
    }

    async deleteOne(dto: PasswordDto,userData: UserData) {

        const user= await this.user.findOneOrFail({where: {id: userData.id}})
      
        const isValid= await bcrypt.compare(dto.password,user.password)
        if(!isValid) {
            throw new BadRequestException('Incrorrect password')
        }

        if(user.avatar) {
            const url= user.avatar.split('/')
            const fileName= url[url.length - 1]
            const public_id= `avatar/${fileName.split('.')[0]}`
            await this.cloudinaryService.deleteFile(public_id,'image')
        }
        await this.user.delete({id: userData.id})

        return {
            success: true,
            message:  'User deleted successfully'
        }
    }

}
