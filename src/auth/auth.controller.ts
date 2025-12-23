import { Body, Controller, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, RegisterDto, EmailDto, VerifyOtpDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth-dto';
import { CurrentUser } from 'src/common/decorators/CurrentUser';
import type { UserData } from 'src/common/interfaces/all-interfaces';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('auth')

export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('/register')
    register(@Body() dto: RegisterDto ) {
       return this.authService.register(dto)
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('/verify-otp')
    verifyOTP(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOTP(dto)
    }
    
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('/resend-otp')
    resendOTP(@Body() dto: EmailDto) {
        return this.authService.resendOTP(dto)
    }
    
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('/login')
    login(@Body() dto: loginDto) {
        return this.authService.login(dto)
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('/forgot-password')
    forgotPassword(@Body() dto: EmailDto) {
        return this.authService.forgotPassword(dto)
    }

    @Post('/reset-password/:token')
    resetPassword(@Param('token') token: string ,@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(token,dto)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/change-password')
    changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() userData: UserData) {
        return this.authService.changePassword(dto,userData)
    }

}
