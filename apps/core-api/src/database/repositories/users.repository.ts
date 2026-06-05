import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserPermissionsById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        permissions: true,
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
      },
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  findManageableUsersForAdminTop(excludeUserId: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: excludeUserId },
      },
      select: this.userListSelect(),
      orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findManageableUsersForAdminMiddle(userId: string) {
    return this.prisma.user.findMany({
      where: {
        managedById: userId,
      },
      select: this.userListSelect(),
      orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    level: number;
    permissions: string[];
    managedById: string;
    isActive: boolean;
  }) {
    return this.prisma.user.create({
      data,
      select: this.userListSelect(),
    });
  }

  findManagedTargetById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.userListSelect(),
        managedById: true,
        permissions: true,
      },
    });
  }

  update(id: string, data: object) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userListSelect(),
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: this.userListSelect(),
    });
  }

  private userListSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      level: true,
      permissions: true,
      isActive: true,
      managedById: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}
