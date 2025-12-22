import { BadRequestException, Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { loginDto, RegisterDto, EmailDto, VerifyOtpDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth-dto';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { sendEmail } from 'src/common/utils/email';
import { UserData } from 'src/common/interfaces/all-interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import {Role} from './entities/user.entity'
@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(User) private user: Repository<User>
    ) {}

    private generateToken({id, role}: Record<string,string>) {
        return  this.jwtService.sign({id,role})
    }
   
    async register(dto: RegisterDto) {
        const existingUser= await this.user.findOne({where: {email: dto.email}}) 

        const user=  this.user.create({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            ...(dto.phone && {phone: dto.phone})
        })

        const otp= crypto.randomInt(0, 10 ** 6).toString().padStart(6,'0')
 
        user.otp=otp
        user.otpExpiry=new Date(Date.now() + 10 * 60 * 1000)
        
        await this.user.save(user)

        await sendEmail('otp',user.email,otp)
        return {
            success: true,
            message: 'User created successfully, please enter your OTP code',
        }
    }

    async verifyOTP(dto: VerifyOtpDto) {
        const user= await this.user.findOneOrFail({where: {
            email: dto.email,
            otp: dto.otp,
            otpExpiry: MoreThan(new Date())
        }})
        
        user.isVerified=true
        user.otp=null,
        user.otpExpiry=null

        await this.user.save(user)
        const token= this.generateToken({id: user.id,role: user.role})

        return {
            success: true,
            message: 'User verified successfully',
            token
        }

    }

    async resendOTP(dto: EmailDto) {
        const user = await this.user.findOneOrFail({
          where: {
            email: dto.email,
        }})

        if(user.isVerified === true) {
            throw new BadRequestException('User already verified')
        }        

        const otp= crypto.randomInt(0, 10 ** 6).toString().padStart(6,'0')
        await sendEmail('otp',user.email,otp)

        user.otp= otp
        user.otpExpiry= new Date(Date.now() + 10 * 60 * 1000)

        await this.user.save(user)

        return {
            success: true,
            message: 'OTP resend successfully'
        }
    }

    async login(dto: loginDto) {
        const exists= await this.user.findOneOrFail({where: {email: dto.email}})

        // if(!exists.isVerified) {
        //     throw new BadRequestException('Email verification required')
        // }
        const isValid= await bcrypt.compare(dto.password,exists.password)

        if(!isValid) {
            throw new BadRequestException('Incrorrect email or password')
        }

        const token= this.generateToken({id: exists.id,role: exists.role})
        return {
            success: true,
            message: 'Login successfully',
            role: exists.role,
            token
        }
    }

    async forgotPassword(dto: EmailDto) {
        const user= await this.user.findOneOrFail({where: {email: dto.email}})

        const token= crypto.randomBytes(32).toString('hex')
        const hashToken= crypto.createHash('sha256').update(token).digest('hex')

        user.resetPasswordToken=hashToken
        user.resetPasswordExpiry=new Date(Date.now() + 15 * 60 * 1000)

        await this.user.save(user)

        const url= `${process.env.FRONTEND_URL}/auth/reset-password/${token}`

        await sendEmail('resetPassword',user.email,url)
        return {
            success: true,
            message: 'If the email exists, a reset password link has been sent.'
        }
    }

    async resetPassword(token: string,dto: ResetPasswordDto) {
        const hashToken= crypto.createHash('sha256').update(token).digest('hex')
        const user= await this.user.findOneOrFail({
            where: {
                resetPasswordToken: hashToken,
                resetPasswordExpiry: MoreThan(new Date())
            }
        })

      

        user.password= dto.password
        user.resetPasswordToken= null
        user.resetPasswordExpiry= null

        await this.user.save(user)

        return {
            success: true,
            message: 'Password reset successfully, please login with your new password'
        }
    }

    async changePassword(dto: ChangePasswordDto, userData: UserData) {

        const user= await this.user.findOneBy({id: userData.id})
        if(!user) {
            throw new BadRequestException('User not found')
        }
        if(dto.currentPassword === dto.newPassword) {
            throw new BadRequestException('Current and new password cannot be the same')
        }
        const isValid= await bcrypt.compare(dto.currentPassword,user.password)
        if(!isValid) {
            throw new BadRequestException('Current password is incorrect')
        }

        user.password= dto.newPassword

        await this.user.save(user)

        return {
            success: true,
            message: 'Password changed successfully'
        }
    }
}

