<script setup lang="ts">
const client = useApiClient()
const { shopId, validateShopRoute } = useShopRouteContext()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'product.view'
})

await validateShopRoute()

const { data: products, pending, error } = await useAsyncData(
  () => `products-${shopId.value}`,
  () => client.getProducts(shopId.value)
)
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Products</h3>
        <p class="muted">Current product catalog for the selected shop.</p>
      </div>
    </div>

    <div v-if="pending" class="state-card">Loading products...</div>
    <div v-else-if="error" class="state-card error">Unable to load products.</div>
    <div v-else-if="!products?.length" class="state-card">No products yet.</div>
    <div v-else class="table">
      <div class="table-row header four">
        <span>Name</span>
        <span>Category</span>
        <span>Price</span>
        <span>Status</span>
      </div>
      <div v-for="product in products" :key="product.id" class="table-row four">
        <span>{{ product.name }}</span>
        <span>{{ product.category?.name || 'Unassigned' }}</span>
        <span>${{ product.price }}</span>
        <span class="pill" :class="product.isAvailable ? 'ok' : 'warn'">{{ product.isAvailable ? 'Available' : 'Hidden' }}</span>
      </div>
    </div>
  </section>
</template>
