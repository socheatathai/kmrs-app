import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { CommonModule } from './common/common.module';
import { RequestContextModule } from './common/context/request-context.module';
import { RequestContextMiddleware } from './common/context/request-context.middleware';
import { PrismaModule } from './database/prisma/prisma.module';
import { I18nModule } from './common/i18n/i18n.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ShopsModule } from './modules/shops/shops.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { QrCodesModule } from './modules/qr-codes/qr-codes.module';
import { PublicModule } from './modules/public/public.module';
import { UsersModule } from './modules/users/users.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    RequestContextModule,
    I18nModule,
    CommonModule,
    AuthModule,
    PlansModule,
    SubscriptionsModule,
    ShopsModule,
    CategoriesModule,
    ProductsModule,
    QrCodesModule,
    PublicModule,
    UsersModule,
    AuditLogsModule,
    UploadsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
