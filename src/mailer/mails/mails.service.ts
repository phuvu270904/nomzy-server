import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async forgotPassword(mailData: {
    to: string;
    data: {
      token: string;
      user_name: string;
    };
  }): Promise<void> {
    // Use `process.cwd()` as fallback if `workingDirectory` is not set
    const workingDir = process.cwd(); // Default to project root
    const templatePath = path.join(
      workingDir,
      'src',
      'mailer',
      'templates',
      'reset-password.hbs',
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Reset Password',
      templatePath,
      context: {
        username: mailData.data.user_name,
        resetLink: `${this.configService.get<string>('app.clientURL')}/reset-password?token=${encodeURIComponent(mailData.data.token)}`,
      },
    });
  }
}
