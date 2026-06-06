export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  const session = useSessionStore()
  await auth.initialize()

  if (auth.isAuthenticated) {
    return navigateTo(session.landingPath)
  }
})
