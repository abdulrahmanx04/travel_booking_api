
export interface UserData {
    id: string,
    role: string
}


export interface AuthRequest {
    user?: UserData
}

export interface NodeMailerOptions {
    from: string
    to: string
    subject: string
    html?: string
}


export interface UploadedMedia {
    fileUrl: string
    fileType: string
}


export interface CheckoutData {
    amount: number,
    currency: string,
    bookingId: string,
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string
}

export interface PaymentData {
    amount: number,
    currency: string,
    metadata?: Record<string,any>
}   


export interface RefundData {
    paymentIntentId: string,
    amount?: number;
    reason?: string
}   