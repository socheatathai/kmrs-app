import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.shop.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findManyByOwnerId(ownerId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findManyByMemberUserId(userId: string) {
    return this.prisma.shop.findMany({
      where: {
        members: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  countActiveByOwnerId(ownerId: string) {
    return this.prisma.shop.count({
      where: {
        ownerId,
        isActive: true,
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.shop.findUnique({
      where: { slug },
    });
  }

  create(data: {
    ownerId: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    phone?: string;
    address?: string;
  }) {
    return this.prisma.shop.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.shop.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
      },
    });
  }

  findByIdAndOwnerId(id: string, ownerId: string) {
    return this.prisma.shop.findFirst({
      where: {
        id,
        ownerId,
      },
      select: { id: true },
    });
  }

  findDetailById(id: string) {
    return this.prisma.shop.findUnique({
      where: { id },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          orderBy: { sortOrder: 'asc' },
        },
        qrCodes: true,
      },
    });
  }

  update(id: string, data: object) {
    return this.prisma.shop.update({
      where: { id },
      data,
    });
  }

  findAllNames() {
    return this.prisma.shop.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOwnedNamesByUserId(userId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveBySlug(slug: string) {
    return this.prisma.shop.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
      },
    });
  }
}
