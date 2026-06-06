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

if (!canAccessShop.value) {
  await navigateTo('/shops')
}

const { data, pending, error } = await useAsyncData(
  () => `catalog-${shopId.value}`,
  async () => {
    if (!canAccessShop.value) {
      return null
    }

    const [categories, products, qrCodes] = await Promise.all([
      client.getCategories(shopId.value),
      client.getProducts(shopId.value),
      client.getQrCodes(shopId.value)
    ])

    return { categories, products, qrCodes }
  }
)
</script>

<template>
  <div class="stack">
    <section class="grid">
      <div class="card metric"><span class="muted">Categories</span><strong class="metric-value">{{ data?.categories.length ?? 0 }}</strong></div>
      <div class="card metric"><span class="muted">Products</span><strong class="metric-value">{{ data?.products.length ?? 0 }}</strong></div>
      <div class="card metric"><span class="muted">QR Codes</span><strong class="metric-value">{{ data?.qrCodes.length ?? 0 }}</strong></div>
    </section>

    <div v-if="pending" class="empty">Loading catalog...</div>
    <div v-else-if="error" class="error">Unable to load catalog.</div>

    <section v-else class="panel">
      <div class="panel-head">
        <div>
          <h2>Products</h2>
          <p class="muted">Product list from `/shops/:shopId/products`.</p>
        </div>
      </div>
      <div v-if="!data?.products.length" class="empty">No products yet.</div>
      <div v-else class="table">
        <div class="row head four">
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
        </div>
        <div v-for="product in data.products" :key="product.id" class="row four">
          <strong>{{ product.name }}</strong>
          <span>{{ product.category?.name || 'Unassigned' }}</span>
          <span>${{ product.price }}</span>
          <span class="pill" :class="product.isAvailable ? 'ok' : 'warn'">{{ product.isAvailable ? 'Available' : 'Hidden' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
