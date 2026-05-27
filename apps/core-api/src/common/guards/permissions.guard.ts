import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessControlService } from '../services/access-control.service';
import { I18nService } from '../i18n/i18n.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { Permission } from '../auth/permissions';
import type { AuthUser } from '../types/auth-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessControl: AccessControlService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const permissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissions || permissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params?: Record<string, string | undefined>;
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(this.i18n.t('auth.forbidden'));
    }

    const shopId = request.params?.shopId;

    for (const permission of permissions) {
      const allowed = await this.accessControl.hasPermission(
        user,
        permission,
        shopId,
      );

      if (!allowed) {
        throw new ForbiddenException(this.i18n.t('auth.forbidden'));
      }
    }

    return true;
  }
}
