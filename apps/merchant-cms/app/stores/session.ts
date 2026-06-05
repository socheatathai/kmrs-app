import { createApiClient } from '@kmrs-app/api-client'
import type {
  AccessibleShop,
  AllowedMenu,
  DashboardMode,
  Permission,
  SessionUser
} from '@kmrs-app/types'

export const useSessionStore = defineStore('session', () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const user = ref<SessionUser | null>(null)
  const permissions = ref<Permission[]>([])
  const allowedMenus = ref<AllowedMenu[]>([])
  const accessibleShops = ref<AccessibleShop[]>([])
  const loaded = ref(false)

  const mode = computed<DashboardMode>(() => (user.value?.role === 'SUPER_ADMIN' ? 'admin' : 'merchant'))
  const level = computed(() => user.value?.level ?? 3)
  const displayName = computed(() => user.value?.name || 'Workspace User')
  const roleLabel = computed(() => {
    const role = user.value?.role

    if (role === 'SUPER_ADMIN') {
      return `Platform Admin - L${user.value?.level ?? 1}`
    }

    if (role === 'MERCHANT_OWNER') {
      return `Merchant Owner - L${user.value?.level ?? 2}`
    }

    return `Staff - L${user.value?.level ?? 3}`
  })
  const landingPath = computed(() => (mode.value === 'admin' ? '/admin/dashboard' : '/merchant/dashboard'))

  const hasPermission = (permission?: Permission) => {
    if (!permission) {
      return true
    }

    return permissions.value.includes(permission)
  }

  const clear = () => {
    user.value = null
    permissions.value = []
    allowedMenus.value = []
    accessibleShops.value = []
    loaded.value = false
  }

  const fetchSession = async () => {
    if (!auth.accessToken) {
      clear()
      return null
    }

    const client = createApiClient({
      baseURL: config.public.apiBase,
      getAccessToken: () => auth.accessToken
    })

    try {
      const session = await client.getSession()
      user.value = session.user
      permissions.value = session.permissions
      allowedMenus.value = session.allowedMenus
      accessibleShops.value = session.accessibleShops
      loaded.value = true
      return session
    } catch (error) {
      const refreshed = await auth.tryRefresh()

      if (!refreshed) {
        clear()
        throw error
      }

      const retryClient = createApiClient({
        baseURL: config.public.apiBase,
        getAccessToken: () => auth.accessToken
      })
      const session = await retryClient.getSession()
      user.value = session.user
      permissions.value = session.permissions
      allowedMenus.value = session.allowedMenus
      accessibleShops.value = session.accessibleShops
      loaded.value = true
      return session
    }
  }

  return {
    user,
    permissions,
    allowedMenus,
    accessibleShops,
    loaded,
    mode,
    level,
    displayName,
    roleLabel,
    landingPath,
    hasPermission,
    fetchSession,
    clear
  }
})
