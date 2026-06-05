import { Global, Module } from '@nestjs/common';

import {
  AuditLogsRepository,
  AuthRepository,
  CategoriesRepository,
  PlansRepository,
  ProductsRepository,
  PublicRepository,
  QrCodesRepository,
  ShopMembersRepository,
  ShopsRepository,
  SubscriptionsRepository,
  UsersRepository,
} from '../repositories';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    AuditLogsRepository,
    AuthRepository,
    CategoriesRepository,
    PlansRepository,
    ProductsRepository,
    PublicRepository,
    QrCodesRepository,
    ShopMembersRepository,
    ShopsRepository,
    SubscriptionsRepository,
    UsersRepository,
  ],
  exports: [
    PrismaService,
    AuditLogsRepository,
    AuthRepository,
    CategoriesRepository,
    PlansRepository,
    ProductsRepository,
    PublicRepository,
    QrCodesRepository,
    ShopMembersRepository,
    ShopsRepository,
    SubscriptionsRepository,
    UsersRepository,
  ],
})
export class PrismaModule {}
