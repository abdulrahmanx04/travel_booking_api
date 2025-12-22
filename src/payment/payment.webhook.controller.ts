import { Controller, Post, Headers, Req, HttpCode } from "@nestjs/common";
import { StripeService } from "src/stripe/stripe.service";
import { PaymentService } from "./payment.service";
import { Request } from "express";


@Controller('webhooks')
export class WebhookController {
    constructor(private stripeService: StripeService,
        private paymentService: PaymentService
    ) {}

    @Post('stripe')
    @HttpCode(200)
    async handleStripeWebhook(@Req() req : Request & {rawBody: Buffer},
    @Headers('stripe-signature') signature: string 
) { 
    try {
        const event= this.stripeService.constructWebhook(req.rawBody, signature)
        await this.paymentService.handleWebhookEvent(event)
        return {received: true, type: event.type}
    }catch(err) {
        return {received: false, error: err.message}
    }
}  
}   