<script setup lang="ts">
const client = useApiClient()
const shopStore = useShopStore()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'shop.view'
})

const { data: shops, pending, error, refresh } = await useAsyncData('shops-index', () => client.getShops())

watch(
  shops,
  () => {
    shopStore.initializeSelection()
  },
  { immediate: true }
)
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Shops</h3>
        <p class="muted">Choose the shop context for catalog and QR management.</p>
      </div>
      <button class="btn ghost" type="button" @click="() => refresh()">Refresh</button>
    </div>

    <div v-if="pending" class="state-card">
      Loading shops...
    </div>
    <div v-else-if="error" class="state-card error">
      Unable to load shops.
    </div>
    <div v-else-if="!shops?.length" class="state-card">
      No shops yet. Use the API to create one, then this list will populate.
    </div>
    <div v-else class="table">
      <div class="table-row header four">
        <span>Name</span>
        <span>Slug</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div v-for="shop in shops" :key="shop.id" class="table-row four">
        <span>{{ shop.name }}</span>
        <span>{{ shop.slug }}</span>
        <span class="pill" :class="shop.isActive ? 'ok' : 'warn'">{{ shop.isActive ? 'Active' : 'Inactive' }}</span>
        <div class="inline-actions">
          <button class="btn ghost small" type="button" @click="shopStore.setSelectedShop(shop.id)">
            Select
          </button>
          <NuxtLink class="link-inline" :to="`/merchant/shops/${shop.id}/settings`">Open</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
