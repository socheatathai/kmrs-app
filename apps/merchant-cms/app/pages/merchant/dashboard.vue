<script setup lang="ts">
const session = useSessionStore()
const shopStore = useShopStore()
const client = useApiClient()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'dashboard.view'
})

const { data: shops, pending, error } = await useAsyncData('merchant-shops', async () => {
  const items = await client.getShops()
  shopStore.initializeSelection()
  return items
})

const selectedShop = computed(() => shops.value?.find((shop) => shop.id === shopStore.selectedShopId) ?? null)
</script>

<template>
  <div class="page-stack">
    <section class="grid">
      <div class="card stat-card">
        <p class="eyebrow">Accessible Shops</p>
        <h2>{{ session.accessibleShops.length }}</h2>
        <p class="muted">Shops available in this session profile.</p>
      </div>
      <div class="card stat-card">
        <p class="eyebrow">Current Shop</p>
        <h2>{{ selectedShop?.name || 'None' }}</h2>
        <p class="muted">Active shop context for catalog management.</p>
      </div>
      <div class="card stat-card">
        <p class="eyebrow">Permission Set</p>
        <h2>{{ session.permissions.length }}</h2>
        <p class="muted">Permissions loaded from the latest session state.</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Workspace Summary</h3>
          <p class="muted">Real session data from current shops access.</p>
        </div>
      </div>

      <div v-if="pending" class="state-card">
        Loading merchant workspace...
      </div>
      <div v-else-if="error" class="state-card error">
        Unable to load merchant workspace.
      </div>
      <div v-else-if="!shops?.length" class="state-card">
        No shops found. Create your first shop to continue.
      </div>
      <div v-else class="table">
        <div class="table-row header four">
          <span>Shop</span>
          <span>Slug</span>
          <span>Status</span>
          <span>Open</span>
        </div>
        <div v-for="shop in shops" :key="shop.id" class="table-row four">
          <span>{{ shop.name }}</span>
          <span>{{ shop.slug }}</span>
          <span class="pill" :class="shop.isActive ? 'ok' : 'warn'">{{ shop.isActive ? 'Active' : 'Inactive' }}</span>
          <NuxtLink class="link-inline" :to="`/merchant/shops/${shop.id}/settings`">Open shop</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
