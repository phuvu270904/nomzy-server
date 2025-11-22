import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="font-size: 16px; color: #555;">Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 32px; color: #007bff; letter-spacing: 5px;">${code}</strong>
          </div>
          <p style="font-size: 14px; color: #777;">This code will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #777;">If you did not request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} Nomzy. All rights reserved.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    resetUrl?: string,
  ): Promise<void> {
    const defaultResetUrl = `http://${process.env.FRONTEND_HOST}/reset-password?token=${token}`;
    const finalResetUrl = resetUrl || defaultResetUrl;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">
            We received a request to reset your password. Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${finalResetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #777; margin-top: 20px;">
            This link will expire in 15 minutes.
          </p>
          <p style="font-size: 14px; color: #777;">
            If you did not request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} Nomzy. All rights reserved.
          </p>
        </div>
      `,
    });
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string,
  ): Promise<void> {
    const promises = recipients.map((recipient) =>
      this.mailerService.sendMail({
        to: recipient,
        subject,
        html,
      }),
    );

    await Promise.all(promises);
  }
}
