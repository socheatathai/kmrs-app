<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const shopStore = useShopStore()
const destination = computed(() =>
  shopStore.selectedShopId
    ? `/merchant/shops/${shopStore.selectedShopId}/products`
    : '/merchant/shops'
)

await navigateTo(destination.value)
</script>
