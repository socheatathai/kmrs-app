import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { RequestContextModule } from './context/request-context.module';
import { I18nModule } from './i18n/i18n.module';
import { PrismaModule } from '../database/prisma/prisma.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { RequestMetricsInterceptor } from './interceptors/request-metrics.interceptor';
import { ResponseSanitizerInterceptor } from './interceptors/response-sanitizer.interceptor';
import { AuditLogService } from './services/audit-log.service';
import { AccessControlService } from './services/access-control.service';
import { DatabaseService } from './services/database.service';
import { LevelHierarchyService } from './services/level-hierarchy.service';
import { PlanLimitService } from './services/plan-limit.service';
import { SubscriptionAccessService } from './services/subscription-access.service';

@Module({
  imports: [
    PrismaModule,
    RequestContextModule,
    I18nModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttleTtlMs') ?? 60_000,
          limit: configService.get<number>('throttleLimit') ?? 120,
        },
      ],
    }),
  ],
  providers: [
    AuditLogService,
    AccessControlService,
    DatabaseService,
    LevelHierarchyService,
    SubscriptionAccessService,
    PlanLimitService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSanitizerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    AuditLogService,
    AccessControlService,
    DatabaseService,
    LevelHierarchyService,
    SubscriptionAccessService,
    PlanLimitService,
  ],
})
export class CommonModule {}
