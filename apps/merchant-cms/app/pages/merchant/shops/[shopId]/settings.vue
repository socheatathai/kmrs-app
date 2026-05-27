<script setup lang="ts">
const client = useApiClient()
const { shopId, validateShopRoute } = useShopRouteContext()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'shop.settings.view'
})

await validateShopRoute()

const { data: shop, pending, error } = await useAsyncData(
  () => `shop-settings-${shopId.value}`,
  () => client.getShop(shopId.value)
)
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Shop Settings</h3>
        <p class="muted">Profile, branding, and live status for the selected shop.</p>
      </div>
    </div>

    <div v-if="pending" class="state-card">
      Loading shop details...
    </div>
    <div v-else-if="error" class="state-card error">
      Unable to load shop details.
    </div>
    <div v-else-if="shop" class="info-list">
      <div class="info-item"><span class="eyebrow">Name</span><strong>{{ shop.name }}</strong></div>
      <div class="info-item"><span class="eyebrow">Slug</span><strong>{{ shop.slug }}</strong></div>
      <div class="info-item"><span class="eyebrow">Phone</span><strong>{{ shop.phone || 'Not set' }}</strong></div>
      <div class="info-item"><span class="eyebrow">Address</span><strong>{{ shop.address || 'Not set' }}</strong></div>
      <div class="info-item"><span class="eyebrow">Description</span><strong>{{ shop.description || 'Not set' }}</strong></div>
    </div>
  </section>
</template>
