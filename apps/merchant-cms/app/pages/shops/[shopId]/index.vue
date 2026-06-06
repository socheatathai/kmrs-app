<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const client = useApiClient()
const shopStore = useShopStore()
const shopId = computed(() => {
  const value = route.params.shopId
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const canAccessShop = computed(() => shopStore.canAccess(shopId.value))

if (!shopStore.select(shopId.value)) {
  await navigateTo('/shops')
}

const { data: shop, pending, error } = await useAsyncData(
  () => `shop-${shopId.value}`,
  () => canAccessShop.value ? client.getShop(shopId.value) : Promise.resolve(null)
)
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>{{ shop?.name || 'Shop details' }}</h2>
          <p class="muted">Profile data from `/shops/:shopId`.</p>
        </div>
        <NuxtLink class="button" :to="`/shops/${shopId}/catalog`">Open catalog</NuxtLink>
      </div>

      <div v-if="pending" class="empty">Loading shop...</div>
      <div v-else-if="error" class="error">Unable to load shop.</div>
      <div v-else-if="shop" class="grid">
        <div class="card"><span class="muted">Slug</span><strong>{{ shop.slug }}</strong></div>
        <div class="card"><span class="muted">Phone</span><strong>{{ shop.phone || 'Not set' }}</strong></div>
        <div class="card"><span class="muted">Address</span><strong>{{ shop.address || 'Not set' }}</strong></div>
        <div class="card"><span class="muted">Status</span><strong>{{ shop.isActive ? 'Active' : 'Inactive' }}</strong></div>
      </div>
    </section>
  </div>
</template>
