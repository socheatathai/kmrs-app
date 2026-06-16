import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { PassportModule } from '@nestjs/passport';

import { CommonModule } from '../../common/common.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    CommonModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET is not set');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '15m',
          },
        };
      },
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('SMTP_HOST') ?? 'smtp.gmail.com';
        const port = Number(configService.get<string>('SMTP_PORT') ?? 587);
        const user = configService.get<string>('SMTP_USER');
        const pass = configService
          .get<string>('SMTP_PASS')
          ?.replace(/\s+/g, '');
        const timeout = Number(
          configService.get<string>('SMTP_TIMEOUT_MS') ?? 10000,
        );

        return {
          transport: {
            host,
            port,
            secure: port === 465,
            auth: user && pass ? { user, pass } : undefined,
            connectionTimeout: timeout,
            greetingTimeout: timeout,
            socketTimeout: timeout,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
