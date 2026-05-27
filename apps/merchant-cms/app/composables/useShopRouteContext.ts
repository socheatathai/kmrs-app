export const useShopRouteContext = () => {
  const route = useRoute()
  const shopStore = useShopStore()

  const shopId = computed(() => String(route.params.shopId ?? ''))

  const validateShopRoute = async () => {
    if (!shopId.value || !shopStore.setSelectedShop(shopId.value)) {
      await navigateTo('/merchant/shops')
      return false
    }

    return true
  }

  return {
    shopId,
    validateShopRoute
  }
}
