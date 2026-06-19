import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { PrismaService } from '../../database/prisma/prisma.service';

const PASSWORD_RESET_EMAIL_DAILY_LIMIT = 80;
const PASSWORD_RESET_USAGE_PREFIX = 'password-reset';
const EMAIL_SEND_TIMEOUT_MS = 10_000;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend?: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set. Email sending is disabled.');
      return;
    }

    this.resend = new Resend(apiKey);
  }

  async sendResetPasswordEmail(email: string, resetUrl: string) {
    const from = this.configService.get<string>('EMAIL_FROM');

    if (!from) {
      throw new Error('EMAIL_FROM is not set');
    }

    if (!this.resend) {
      throw new Error('RESEND_API_KEY is not set');
    }

    await this.reservePasswordResetEmailQuota();

    const { error } = await this.withTimeout(
      this.resend.emails.send({
        from,
        to: [email],
        subject: 'Reset Your Password',
        html: this.buildResetPasswordHtml(resetUrl),
        text: `Reset your KMRS password using this link: ${resetUrl}. This link expires in 60 minutes.`,
      }),
    );

    if (error) {
      this.logger.error(
        `Resend password reset email failed for ${email}: ${JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException(
        'Unable to send password reset email. Please try again later.',
      );
    }
  }

  private withTimeout<T>(promise: Promise<T>) {
    let timeout: NodeJS.Timeout;
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Resend email send timed out')),
          EMAIL_SEND_TIMEOUT_MS,
        );
      }),
    ]).finally(() => clearTimeout(timeout));
  }

  private async reservePasswordResetEmailQuota() {
    const key = `${PASSWORD_RESET_USAGE_PREFIX}:${this.getUtcDateKey()}`;
    const updatedRows = await this.prisma.$executeRaw`
      INSERT INTO "EmailDailyUsage" ("key", "count", "createdAt", "updatedAt")
      VALUES (${key}, 1, NOW(), NOW())
      ON CONFLICT ("key")
      DO UPDATE SET
        "count" = "EmailDailyUsage"."count" + 1,
        "updatedAt" = NOW()
      WHERE "EmailDailyUsage"."count" < ${PASSWORD_RESET_EMAIL_DAILY_LIMIT}
    `;

    if (updatedRows === 0) {
      this.logger.warn(
        `Password reset email daily limit reached for key=${key}`,
      );
      throw new HttpException(
        'Daily password reset email limit reached. Please try again tomorrow.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private getUtcDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private buildResetPasswordHtml(resetUrl: string) {
    const escapedResetUrl = this.escapeHtml(resetUrl);

    return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:32px 28px 12px;">
                <h1 style="margin:0;font-size:24px;line-height:32px;color:#111827;">Reset Your Password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;font-size:16px;line-height:24px;color:#374151;">
                We received a request to reset your KMRS Merchant CMS password. This link expires in 60 minutes.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 28px 28px;">
                <a href="${escapedResetUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 22px;border-radius:6px;">Reset password</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;font-size:14px;line-height:22px;color:#6b7280;">
                If the button does not work, copy and paste this link into your browser:<br />
                <a href="${escapedResetUrl}" style="color:#047857;word-break:break-all;">${escapedResetUrl}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#f9fafb;font-size:13px;line-height:20px;color:#6b7280;">
                If you did not request this password reset, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
