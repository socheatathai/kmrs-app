import type { Permission } from '@kmrs-app/types'

export default defineNuxtRouteMiddleware((to) => {
  const session = useSessionStore()
  const requiredPermission = to.meta.permission as Permission | undefined

  if (!requiredPermission || session.hasPermission(requiredPermission)) {
    return
  }

  return navigateTo(session.landingPath)
})
