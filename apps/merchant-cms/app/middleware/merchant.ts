export default defineNuxtRouteMiddleware(() => {
  const session = useSessionStore()

  if (session.mode !== 'merchant') {
    return navigateTo('/admin/dashboard')
  }
})
