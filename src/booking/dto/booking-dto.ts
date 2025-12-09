import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";



export class CreateBookDto {
    
    @IsNotEmpty()
    @Length(3,30)
    customerName: string

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    guestCount: number

    @IsNotEmpty()
    @IsUUID()
    packageId: string

    @IsNotEmpty()
    @IsString()
    destination: string

    @IsNotEmpty()
    @IsDateString()
    travelDate: string
}


export class UpdateBookingDto {
    
    @IsOptional()
    @Length(3,30)
    customerName?: string

    @IsOptional()
    @IsNumber()
    @Min(1)
    guestCount?: number

    @IsOptional()
    @IsUUID()
    packageId?: string

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    price?: number

    @IsOptional()
    @IsString()
    status?: string

    
    @IsOptional()
    @IsString()
    destination?: string

    @IsOptional()
    @IsDateString()
    travelDate?: string
}