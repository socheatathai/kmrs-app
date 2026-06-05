import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  createMerchantOwner(data: {
    name: string;
    email: string;
    password: string;
    level: number;
    permissions: string[];
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.MERCHANT_OWNER,
        level: data.level,
        permissions: data.permissions,
      },
    });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findUserForSession(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        isActive: true,
      },
    });
  }

  findUserTokenStateById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        level: true,
        isActive: true,
        tokenVersion: true,
        refreshTokenHash: true,
      },
    });
  }

  updateRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  revokeUserTokens(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        refreshTokenHash: null,
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }
}
