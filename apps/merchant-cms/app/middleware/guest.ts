export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  const session = useSessionStore()
  await auth.initialize()

  if (auth.isAuthenticated) {
    const hasSubscription = await auth.checkActiveSubscription()

    if (!hasSubscription) {
      return navigateTo('/subscription?choosePlan=1')
    }

    return navigateTo(session.landingPath)
  }
})
