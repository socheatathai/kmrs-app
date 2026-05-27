import type { DashboardMode, Permission } from '@kmrs-app/types'

export type CmsNavItem = {
  label: string
  icon: string
  mode: DashboardMode
  permission?: Permission
  to?: string
  children?: Array<{
    label: string
    icon: string
    to: string
    permission?: Permission
    requiresShop?: boolean
  }>
}

export const CMS_NAV_ITEMS: CmsNavItem[] = [
  {
    label: 'Overview',
    icon: '⌂',
    mode: 'admin',
    permission: 'dashboard.view',
    to: '/admin/dashboard'
  },
  {
    label: 'Accounts',
    icon: '◫',
    mode: 'admin',
    permission: 'account.view',
    to: '/admin/accounts'
  },
  {
    label: 'Audit Logs',
    icon: '◎',
    mode: 'admin',
    permission: 'audit.view',
    to: '/admin/audit-logs'
  },
  {
    label: 'Settings',
    icon: '⚙',
    mode: 'admin',
    permission: 'settings.view',
    to: '/admin/settings'
  },
  {
    label: 'Overview',
    icon: '⌂',
    mode: 'merchant',
    permission: 'dashboard.view',
    to: '/merchant/dashboard'
  },
  {
    label: 'Shops',
    icon: '□',
    mode: 'merchant',
    permission: 'shop.view',
    to: '/merchant/shops'
  },
  {
    label: 'Catalog',
    icon: '▦',
    mode: 'merchant',
    children: [
      { label: 'Categories', icon: '◧', to: '/merchant/shops/:shopId/categories', permission: 'category.view', requiresShop: true },
      { label: 'Products', icon: '◇', to: '/merchant/shops/:shopId/products', permission: 'product.view', requiresShop: true },
      { label: 'QR Codes', icon: '▣', to: '/merchant/shops/:shopId/qrcodes', permission: 'qrcode.view', requiresShop: true }
    ]
  },
  {
    label: 'Subscription',
    icon: '◌',
    mode: 'merchant',
    permission: 'subscription.view',
    to: '/merchant/subscription'
  },
  {
    label: 'Settings',
    icon: '⚙',
    mode: 'merchant',
    permission: 'settings.view',
    to: '/merchant/settings'
  }
]

export const routeWithShop = (to: string, shopId: string | null | undefined) =>
  shopId ? to.replace(':shopId', shopId) : '/merchant/shops'
