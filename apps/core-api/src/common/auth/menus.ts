import { PERMISSIONS, type Permission } from './permissions';

export type DashboardMode = 'admin' | 'merchant';

export type MenuChildDefinition = {
  key: string;
  label: string;
  icon: string;
  path: string;
  permission?: Permission;
  requiresShop?: boolean;
};

export type MenuDefinition = {
  key: string;
  label: string;
  icon: string;
  mode: DashboardMode;
  path?: string;
  permission?: Permission;
  requiresShop?: boolean;
  children?: MenuChildDefinition[];
};

/**
 * Server-side source of truth for navigation menus. The session endpoint
 * filters this catalog by the user's mode and current database permissions
 * before returning `allowedMenus`. The frontend renders these as-is and only
 * resolves dynamic segments such as `:shopId`.
 */
export const MENU_CATALOG: MenuDefinition[] = [
  {
    key: 'admin-dashboard',
    label: 'Overview',
    icon: '⌂',
    mode: 'admin',
    permission: PERMISSIONS.dashboardView,
    path: '/admin/dashboard',
  },
  {
    key: 'admin-accounts',
    label: 'Accounts',
    icon: '◫',
    mode: 'admin',
    permission: PERMISSIONS.accountView,
    path: '/admin/accounts',
  },
  {
    key: 'admin-audit-logs',
    label: 'Audit Logs',
    icon: '◎',
    mode: 'admin',
    permission: PERMISSIONS.auditView,
    path: '/admin/audit-logs',
  },
  {
    key: 'admin-settings',
    label: 'Settings',
    icon: '⚙',
    mode: 'admin',
    permission: PERMISSIONS.settingsView,
    path: '/admin/settings',
  },
  {
    key: 'merchant-dashboard',
    label: 'Overview',
    icon: '⌂',
    mode: 'merchant',
    permission: PERMISSIONS.dashboardView,
    path: '/merchant/dashboard',
  },
  {
    key: 'merchant-shops',
    label: 'Shops',
    icon: '□',
    mode: 'merchant',
    permission: PERMISSIONS.shopView,
    path: '/merchant/shops',
  },
  {
    key: 'merchant-catalog',
    label: 'Catalog',
    icon: '▦',
    mode: 'merchant',
    children: [
      {
        key: 'merchant-categories',
        label: 'Categories',
        icon: '◧',
        path: '/merchant/shops/:shopId/categories',
        permission: PERMISSIONS.categoryView,
        requiresShop: true,
      },
      {
        key: 'merchant-products',
        label: 'Products',
        icon: '◇',
        path: '/merchant/shops/:shopId/products',
        permission: PERMISSIONS.productView,
        requiresShop: true,
      },
      {
        key: 'merchant-qrcodes',
        label: 'QR Codes',
        icon: '▣',
        path: '/merchant/shops/:shopId/qrcodes',
        permission: PERMISSIONS.qrCodeView,
        requiresShop: true,
      },
    ],
  },
  {
    key: 'merchant-subscription',
    label: 'Subscription',
    icon: '◌',
    mode: 'merchant',
    permission: PERMISSIONS.subscriptionView,
    path: '/merchant/subscription',
  },
  {
    key: 'merchant-settings',
    label: 'Settings',
    icon: '⚙',
    mode: 'merchant',
    permission: PERMISSIONS.settingsView,
    path: '/merchant/settings',
  },
];

/**
 * Resolve the menus a user is allowed to see given their mode and the set of
 * permissions currently granted in the database.
 */
export function resolveAllowedMenus(
  mode: DashboardMode,
  permissions: Iterable<Permission>,
): MenuDefinition[] {
  const granted = new Set<Permission>(permissions);
  const canView = (permission?: Permission) =>
    !permission || granted.has(permission);

  return MENU_CATALOG.filter((menu) => menu.mode === mode)
    .map((menu) => {
      const children = menu.children?.filter((child) =>
        canView(child.permission),
      );

      return {
        ...menu,
        children,
      };
    })
    .filter((menu) => canView(menu.permission) || Boolean(menu.children?.length));
}
