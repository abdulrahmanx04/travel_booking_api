import {  IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";


export class CreatePaymentDto {

    @IsNotEmpty()
    @IsUUID()
    bookingId: string

    @IsOptional()
    @IsString()
    currency?: string
} 

export class RefundPaymentDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
