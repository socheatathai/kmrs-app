export const useSelectedShop = () => {
  const shopStore = useShopStore()

  return {
    selectedShopId: computed(() => shopStore.selectedShopId),
    selectedShop: computed(() => shopStore.selectedShop),
    setSelectedShop: shopStore.setSelectedShop,
    initializeSelection: shopStore.initializeSelection
  }
}
