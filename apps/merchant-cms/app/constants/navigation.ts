import type { DashboardMode, Permission } from '@kmrs-app/types'

export type NavItem = {
  label: string
  to: string
  icon: string
  mode: DashboardMode | 'all'
  permission?: Permission
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard', mode: 'all', permission: 'dashboard.view' },
  { label: 'Shops', to: '/shops', icon: 'i-lucide-store', mode: 'merchant', permission: 'shop.view' },
  { label: 'Subscription', to: '/subscription', icon: 'i-lucide-credit-card', mode: 'merchant', permission: 'subscription.view' },
  { label: 'Users', to: '/users', icon: 'i-lucide-users', mode: 'admin', permission: 'account.view' },
  { label: 'Audit Logs', to: '/audit-logs', icon: 'i-lucide-clipboard-list', mode: 'admin', permission: 'audit.view' }
]
