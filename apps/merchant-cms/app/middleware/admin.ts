export default defineNuxtRouteMiddleware(() => {
  const session = useSessionStore()

  if (session.mode !== 'admin') {
    return navigateTo('/merchant/dashboard')
  }
})
