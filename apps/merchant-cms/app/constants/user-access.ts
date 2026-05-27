import type { Permission, UserRole } from '@kmrs-app/types'

export const LEVEL_ROLE_MAP: Record<number, UserRole> = {
  1: 'SUPER_ADMIN',
  2: 'MERCHANT_OWNER',
  3: 'STAFF'
}

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3'
}

export const PERMISSION_GROUPS: Array<{ label: string; items: Permission[] }> = [
  {
    label: 'Overview',
    items: ['dashboard.view']
  },
  {
    label: 'Accounts',
    items: ['account.view', 'account.create', 'account.update', 'account.delete', 'member.view']
  },
  {
    label: 'Shops',
    items: ['shop.view', 'shop.create', 'shop.update', 'shop.delete', 'shop.settings.view', 'shop.settings.update']
  },
  {
    label: 'Catalog',
    items: [
      'category.view',
      'category.create',
      'category.update',
      'category.delete',
      'product.view',
      'product.create',
      'product.update',
      'product.delete',
      'qrcode.view',
      'qrcode.create',
      'qrcode.update',
      'qrcode.delete',
      'menu.view',
      'menu.update'
    ]
  },
  {
    label: 'Billing and Settings',
    items: ['subscription.view', 'settings.view', 'settings.update', 'audit.view']
  }
]

export const LEVEL_DEFAULT_PERMISSIONS: Record<number, Permission[]> = {
  1: PERMISSION_GROUPS.flatMap((group) => group.items),
  2: [
    'dashboard.view',
    'account.view',
    'account.create',
    'account.update',
    'account.delete',
    'member.view',
    'shop.view',
    'shop.create',
    'shop.update',
    'shop.settings.view',
    'shop.settings.update',
    'category.view',
    'category.create',
    'category.update',
    'category.delete',
    'product.view',
    'product.create',
    'product.update',
    'product.delete',
    'qrcode.view',
    'qrcode.create',
    'qrcode.update',
    'qrcode.delete',
    'subscription.view',
    'settings.view',
    'settings.update',
    'menu.view',
    'menu.update'
  ],
  3: ['dashboard.view', 'member.view', 'shop.view', 'category.view', 'product.view', 'qrcode.view', 'menu.view']
}

export function normalizePermissions(permissions: Permission[]) {
  return [...new Set(permissions)].sort()
}

export function permissionLabel(permission: string) {
  return permission
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
