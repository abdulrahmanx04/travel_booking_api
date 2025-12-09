import * as nodemailer from 'nodemailer'
import { NodeMailerOptions } from '../interfaces/all-interfaces'
const transporter= nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
})



async function sendEmail(options: NodeMailerOptions) {
    await transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html
    })
}

export async function sendOtpEmail(to: string, otp: string) {
    await sendEmail({
        from: process.env.GMAIL_USER!,
        to,
        subject: 'Your OTP Verification Code',
        html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2 style="color: #333;">OTP Verification</h2>
            <p>Your one-time password (OTP) is:</p>
            <h1 style="color: #2F80ED; letter-spacing: 4px;">${otp}</h1>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
        </div>`
    })
}

export async function  sendRestPasswordEmail(to: string,url: string) {
    
    await sendEmail({
        from: process.env.GMAIL_USER!,
        to,
        subject: 'Reset Your Password',
        html:  `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c3e50;">Password Reset Request</h2>
                <p>You requested a password reset. Click the button below to reset your password. This link expires in 15 minutes.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #3498db;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    ">Reset Password</a>
                </p>
                <p>If you did not request this, you can ignore this email.</p>
                <p style="font-size: 12px; color: #999;">Travel Booking App</p>
            </div>
        `
    })
}