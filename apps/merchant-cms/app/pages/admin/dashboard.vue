<script setup lang="ts">
const client = useApiClient()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'permission'],
  permission: 'dashboard.view'
})

const [{ data: shops, pending: shopsPending, error: shopsError }, { data: plans, pending: plansPending }, { data: subscriptions, pending: subscriptionsPending }] = await Promise.all([
  useAsyncData('admin-shops', () => client.getShops()),
  useAsyncData('admin-plans', () => client.getPlans()),
  useAsyncData('admin-subscriptions', () => client.getMySubscriptions())
])

const activeShops = computed(() => shops.value?.filter((shop) => shop.isActive).length ?? 0)
</script>

<template>
  <div class="page-stack">
    <section class="grid">
      <div class="card stat-card">
        <p class="eyebrow">Shops</p>
        <h2>{{ shops?.length ?? 0 }}</h2>
        <p class="muted">Visible through the current admin session.</p>
      </div>
      <div class="card stat-card">
        <p class="eyebrow">Active Shops</p>
        <h2>{{ activeShops }}</h2>
        <p class="muted">Currently marked active in platform records.</p>
      </div>
      <div class="card stat-card">
        <p class="eyebrow">Plans</p>
        <h2>{{ plans?.length ?? 0 }}</h2>
        <p class="muted">Published subscription tiers.</p>
      </div>
      <div class="card stat-card">
        <p class="eyebrow">My Subscriptions</p>
        <h2>{{ subscriptions?.length ?? 0 }}</h2>
        <p class="muted">Session-scoped until admin reporting endpoints are added.</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Platform Shop Snapshot</h3>
          <p class="muted">Current cross-platform visibility from existing `GET /shops` access.</p>
        </div>
      </div>

      <div v-if="shopsPending || plansPending || subscriptionsPending" class="state-card">
        Loading admin dashboard...
      </div>
      <div v-else-if="shopsError" class="state-card error">
        Unable to load platform summary.
      </div>
      <div v-else-if="!shops?.length" class="state-card">
        No shops are available for this admin session yet.
      </div>
      <div v-else class="table">
        <div class="table-row header four">
          <span>Shop</span>
          <span>Slug</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        <div v-for="shop in shops" :key="shop.id" class="table-row four">
          <span>{{ shop.name }}</span>
          <span>{{ shop.slug }}</span>
          <span class="pill" :class="shop.isActive ? 'ok' : 'warn'">{{ shop.isActive ? 'Active' : 'Inactive' }}</span>
          <span>{{ new Date(shop.updatedAt).toLocaleDateString() }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
