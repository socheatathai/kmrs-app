import { UserRole } from '@prisma/client';
import type { Permission } from '../auth/permissions';

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
  level: number;
  permissions: Permission[];
  tokenVersion: number;
};
