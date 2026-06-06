import type { DashboardMode, Permission } from '@kmrs-app/types'

export const useSessionStore = defineStore('session', () => {
  const auth = useAuthStore()

  const mode = computed<DashboardMode>(() => auth.user?.role === 'SUPER_ADMIN' ? 'admin' : 'merchant')
  const permissions = computed<Permission[]>(() => auth.user?.permissions ?? [])
  const accessibleShops = computed(() => auth.user?.accessibleShops ?? [])
  const displayName = computed(() => auth.user?.name || 'Workspace User')
  const username = computed(() => auth.user?.email || 'No email')
  const profileUrl = computed(() => auth.user?.profileUrl || '')
  const initials = computed(() => {
    const label = auth.user?.name || auth.user?.email || 'User'
    return label
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  })
  const roleLabel = computed(() => {
    if (auth.user?.role === 'SUPER_ADMIN') {
      return `Platform Admin L${auth.user.level}`
    }

    if (auth.user?.role === 'MERCHANT_OWNER') {
      return `Merchant Owner L${auth.user.level}`
    }

    return `Staff L${auth.user?.level ?? 3}`
  })
  const landingPath = computed(() => '/dashboard')

  const can = (permission?: Permission) => !permission || permissions.value.includes(permission)

  return {
    mode,
    permissions,
    accessibleShops,
    displayName,
    username,
    profileUrl,
    initials,
    roleLabel,
    landingPath,
    can
  }
})
