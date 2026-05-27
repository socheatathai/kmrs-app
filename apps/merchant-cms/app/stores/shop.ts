export const useShopStore = defineStore('shop', () => {
  const selectedShopId = useCookie<string | null>('kmrs_selected_shop_id', { sameSite: 'lax' })
  const session = useSessionStore()

  const selectedShop = computed(() =>
    session.accessibleShops.find((shop) => shop.shopId === selectedShopId.value) ?? null
  )

  const canAccessShop = (shopId: string) =>
    session.accessibleShops.some((shop) => shop.shopId === shopId)

  const initializeSelection = () => {
    const shopIds = session.accessibleShops.map((shop) => shop.shopId)
    const fallbackShopId = shopIds[0] ?? null

    if (!fallbackShopId) {
      selectedShopId.value = null
      return
    }

    if (!selectedShopId.value || !shopIds.includes(selectedShopId.value)) {
      selectedShopId.value = fallbackShopId
    }
  }

  const setSelectedShop = (shopId: string) => {
    if (!canAccessShop(shopId)) {
      return false
    }

    selectedShopId.value = shopId
    return true
  }

  return {
    selectedShopId,
    selectedShop,
    canAccessShop,
    initializeSelection,
    setSelectedShop
  }
})
