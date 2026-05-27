export const useSession = () => {
  const auth = useAuthStore()
  const session = useSessionStore()
  const shopStore = useShopStore()

  return {
    auth,
    session,
    shopStore
  }
}
