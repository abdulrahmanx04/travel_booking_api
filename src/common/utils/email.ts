import * as nodemailer from 'nodemailer'
import { NodeMailerOptions } from '../interfaces/all-interfaces'
const transporter= nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
})

export const emailTemplates = {
  otp: (otp: string) => ({
    subject: 'Your OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>OTP Verification</h2>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  }),

  resetPassword: (url: string) => ({
    subject: 'Reset Your Password',
    html: `
      <div>
        <p>Click below to reset your password (expires in 15 minutes)</p>
        <a href="${url}">Reset Password</a>
      </div>
    `,
  }),
  paymentSuccess: () => ({
      subject: 'Payment Successful',
      html: `<p>Your payment was completed successfully.</p>`,
    }),
  paymentRefunded: () => ({
    subject: 'Payment Refunded',
    html: `<p>Your payment has been refunded successfully.</p>`,
  }),

  paymentFailed: (reason?: string) => ({
    subject: 'Payment Failed',
    html: `<p>Your payment failed. ${reason ?? ''}</p>`,
  }),
};



type EmailType= 'otp' | 'resetPassword' | 'paymentSuccess' | 'paymentRefunded' | 'paymentFailed'


export async function sendEmail(type: EmailType, to: string, data?: any) {
    const template= emailTemplates[type](data)
    await transporter.sendMail({
        from: process.env.GMAIL_USER!,
        to,
        subject: template.subject,
        html: template.html
    })
}

