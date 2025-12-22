import { IsOptional, IsNumber, IsString, IsDateString, Min, Length, IsEnum } from "class-validator"
import { BookingStatus } from "src/booking/entities/booking.entity"


export class AdminBookingDto {

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2}) 
    price?: number

    @IsOptional()
    @IsEnum(BookingStatus)
    status?:BookingStatus

    @IsOptional()
    @Length(3,30)
    customerName?: string

    @IsOptional()
    @IsNumber()
    @Min(1)
    guestCount?: number
    
    @IsOptional()
    @IsString()
    destination?: string

    @IsOptional()
    @IsDateString()
    travelDate?: string
}