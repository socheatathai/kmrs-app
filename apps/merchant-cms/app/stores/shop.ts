export const useShopStore = defineStore('shop', () => {
  const session = useSessionStore()
  const selectedShopId = useCookie<string | null>('kmrs_selected_shop_id', { sameSite: 'lax' })

  const selectedShop = computed(() =>
    session.accessibleShops.find((shop) => shop.shopId === selectedShopId.value) ?? null
  )

  const initialize = () => {
    const ids = session.accessibleShops.map((shop) => shop.shopId)
    const fallbackId = ids[0] ?? null

    if (!fallbackId) {
      selectedShopId.value = null
      return
    }

    if (!selectedShopId.value || !ids.includes(selectedShopId.value)) {
      selectedShopId.value = fallbackId
    }
  }

  const canAccess = (shopId: string) =>
    session.mode === 'admin' || session.accessibleShops.some((shop) => shop.shopId === shopId)

  const select = (shopId: string) => {
    if (!canAccess(shopId)) {
      return false
    }

    selectedShopId.value = shopId
    return true
  }

  return {
    selectedShopId,
    selectedShop,
    initialize,
    canAccess,
    select
  }
})
