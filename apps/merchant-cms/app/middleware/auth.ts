export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.initialize()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  if (to.path !== '/subscription') {
    const hasSubscription = await auth.checkActiveSubscription()

    if (!hasSubscription) {
      return navigateTo('/subscription?choosePlan=1')
    }
  }
})
