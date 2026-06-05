import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopMemberRole } from '@prisma/client';

import { LEVEL_DEFAULT_PERMISSIONS, LEVELS } from '../auth/level-permissions';
import type { Permission } from '../auth/permissions';
import { I18nService } from '../i18n/i18n.service';
import type { AuthUser } from '../types/auth-user.type';
import {
  ShopMembersRepository,
  ShopsRepository,
  UsersRepository,
} from '../../database/repositories';

type AccessProfile = {
  permissions: Permission[];
  shops: Array<{
    shopId: string;
    shopName: string;
    role: 'OWNER' | 'STAFF';
    permissions: Permission[];
  }>;
};

@Injectable()
export class AccessControlService {
  constructor(
    private readonly i18n: I18nService,
    private readonly usersRepository: UsersRepository,
    private readonly shopsRepository: ShopsRepository,
    private readonly shopMembersRepository: ShopMembersRepository,
  ) {}

  async getAccessProfile(
    userId: string,
    level: number,
  ): Promise<AccessProfile> {
    const user = await this.usersRepository.findUserPermissionsById(userId);

    const basePermissions = this.resolveBasePermissions(
      level,
      user?.permissions as Permission[] | undefined,
    );

    if (level === LEVELS.ADMIN_TOP) {
      const shops = await this.shopsRepository.findAllNames();

      return {
        permissions: [...basePermissions],
        shops: shops.map((shop) => ({
          shopId: shop.id,
          shopName: shop.name,
          role: 'OWNER',
          permissions: [...basePermissions],
        })),
      };
    }

    const ownedShops = await this.shopsRepository.findOwnedNamesByUserId(userId);

    const memberships =
      await this.shopMembersRepository.findActiveMembershipsByUserId(userId);

    const shops = [
      ...ownedShops.map((shop) => ({
        shopId: shop.id,
        shopName: shop.name,
        role: 'OWNER' as const,
        permissions: [...basePermissions],
      })),
      ...memberships
        .filter(
          (membership) =>
            !ownedShops.some((shop) => shop.id === membership.shop.id),
        )
        .map((membership) => ({
          shopId: membership.shop.id,
          shopName: membership.shop.name,
          role:
            membership.role === ShopMemberRole.OWNER
              ? ('OWNER' as const)
              : ('STAFF' as const),
          permissions: membership.permissions as Permission[],
        })),
    ];

    const permissionSet = new Set<Permission>(basePermissions);
    for (const shop of shops) {
      for (const permission of shop.permissions) {
        permissionSet.add(permission);
      }
    }

    return {
      permissions: [...permissionSet],
      shops,
    };
  }

  async hasPermission(
    user: AuthUser,
    permission: Permission,
    shopId?: string,
  ): Promise<boolean> {
    if (user.level === LEVELS.ADMIN_TOP) {
      return true;
    }

    const record = await this.usersRepository.findUserPermissionsById(user.sub);

    const basePermissions = new Set<Permission>(
      this.resolveBasePermissions(
        user.level,
        record?.permissions as Permission[] | undefined,
      ),
    );

    if (!shopId) {
      return basePermissions.has(permission);
    }

    if (user.level <= LEVELS.ADMIN_MIDDLE) {
      const owned = await this.shopsRepository.findByIdAndOwnerId(shopId, user.sub);

      return Boolean(owned) && basePermissions.has(permission);
    }

    const membership =
      await this.shopMembersRepository.findActiveMembershipPermissionByUserIdAndShopId(
        user.sub,
        shopId,
      );

    if (!membership) {
      return false;
    }

    return membership.permissions.includes(permission);
  }

  private resolveBasePermissions(
    level: number,
    explicitPermissions?: Permission[],
  ): Permission[] {
    if (explicitPermissions && explicitPermissions.length > 0) {
      return explicitPermissions;
    }

    return LEVEL_DEFAULT_PERMISSIONS[level] ?? [];
  }

  async assertPermission(
    user: AuthUser,
    permission: Permission,
    shopId?: string,
    language?: string,
  ) {
    const allowed = await this.hasPermission(user, permission, shopId);

    if (!allowed) {
      throw new ForbiddenException(this.i18n.t('auth.forbidden', language));
    }
  }

  async assertShopAccess(
    user: AuthUser,
    shopId: string,
    permission: Permission,
    language?: string,
  ) {
    const shop = await this.shopsRepository.findById(shopId);

    if (!shop) {
      throw new NotFoundException(this.i18n.t('shop.notFound', language));
    }

    await this.assertPermission(user, permission, shopId, language);

    return shop;
  }
}
