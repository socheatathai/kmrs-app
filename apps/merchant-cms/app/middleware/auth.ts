export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const session = useSessionStore()
  const shopStore = useShopStore()

  await auth.initializeSession()
  shopStore.initializeSelection()

  if (!auth.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo(session.landingPath)
  }
})
