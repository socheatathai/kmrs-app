import type { DashboardMode, Permission } from '@kmrs-app/types'

export const useSessionStore = defineStore('session', () => {
  const auth = useAuthStore()

  const mode = computed<DashboardMode>(() => auth.user?.role === 'SUPER_ADMIN' ? 'admin' : 'merchant')
  const level = computed(() => auth.user?.level ?? 3)
  const permissions = computed<Permission[]>(() => auth.user?.permissions ?? [])
  const accessibleShops = computed(() => auth.user?.accessibleShops ?? [])
  const displayName = computed(() => auth.user?.name || 'Workspace User')
  const roleLabel = computed(() => {
    const role = auth.user?.role

    if (role === 'SUPER_ADMIN') {
      return `Platform Admin - L${auth.user?.level ?? 1}`
    }

    if (role === 'MERCHANT_OWNER') {
      return `Merchant Owner - L${auth.user?.level ?? 2}`
    }

    return `Staff - L${auth.user?.level ?? 3}`
  })
  const landingPath = computed(() => mode.value === 'admin' ? '/admin/dashboard' : '/merchant/dashboard')

  const hasPermission = (permission?: Permission) => {
    if (!permission) {
      return true
    }

    return permissions.value.includes(permission)
  }

  return {
    mode,
    level,
    permissions,
    accessibleShops,
    displayName,
    roleLabel,
    landingPath,
    hasPermission
  }
})
