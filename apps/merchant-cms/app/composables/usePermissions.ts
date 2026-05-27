import type { Permission } from '@kmrs-app/types'

export const usePermissions = () => {
  const session = useSessionStore()

  const can = (permission?: Permission) => session.hasPermission(permission)

  return {
    can
  }
}
