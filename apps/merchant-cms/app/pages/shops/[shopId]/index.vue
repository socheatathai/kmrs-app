<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const shopStore = useShopStore()
const shopId = computed(() => {
  const value = route.params.shopId
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const canAccessShop = computed(() => shopStore.canAccess(shopId.value))

if (!shopStore.select(shopId.value)) {
  await navigateTo('/shops')
}

await navigateTo(`/shops/${shopId.value}/description`)
</script>

<template>
  <div class="empty">Opening shop...</div>
</template>
