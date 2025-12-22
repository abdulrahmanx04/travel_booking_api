import { IsBoolean, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { Role } from "src/auth/entities/user.entity";




export class AdminUpdateUserDto {
    @IsOptional()
    @IsEnum(Role)
    role?: Role

    @IsOptional()
    @IsString()
    @Length(3,30)
    name?: string

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean


    @IsOptional()
    @IsString()
    avatar?: string

}