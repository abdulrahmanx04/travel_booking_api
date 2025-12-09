import {  IsDateString, IsDecimal, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, Max, Min, MinLength } from "class-validator";
import { User } from "../../auth/entities/user.entity";
import { Column, JoinColumn, ManyToOne } from "typeorm";


export class PackageDto {

    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    title: string


    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    @Matches(/^[a-zA-Z\s'-]+$/, {message: 'Destination can only contain letters and spaces'})
    destination: string


    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1)
    price: number 

    @IsNotEmpty()
    @IsInt()
    duration: number


    @IsNotEmpty()
    @IsString()
    @Length(3,200)
    description: string


    @IsNotEmpty()
    @IsDateString()
    startDate: string

    @IsNotEmpty()
    @IsDateString()
    endDate: string

   


}

export class UpdatePackageDto {

    @IsOptional()
    @IsString()
    @Length(3,50)
    title: string


    @IsOptional()
    @IsString()
    @Length(3,50)
    @Matches(/^[a-zA-Z\s'-]+$/, {message: 'Destination can only contain letters and spaces'})
    destination: string


    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1)
    price: number 

    @IsOptional()
    @IsInt()
    duration: number


    @IsOptional()
    @IsString()
    @Length(3,200)
    description: string


    @IsOptional()
    @IsDateString()
    startDate: string

    @IsOptional()
    @IsDateString()
    endDate: string

}