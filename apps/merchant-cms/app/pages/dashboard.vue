<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const session = useSessionStore()
const shopStore = useShopStore()
const config = useRuntimeConfig()

const customerWebUrl = computed(() => config.public.customerWebBase.replace(/\/+$/, ''))

const { data: shops, pending: shopsPending, error: shopsError } = await useAsyncData(
  () => `dashboard-shops-${auth.user?.id ?? 'anonymous'}`,
  () => client.getShops()
)
const { data: subscription } = await useAsyncData(() => `dashboard-subscription-${auth.user?.id ?? 'anonymous'}`, () =>
  session.mode === 'merchant' ? client.getCurrentSubscription().catch(() => null) : Promise.resolve(null)
)

watch(shops, () => shopStore.initialize(), { immediate: true })

const activeShops = computed(() => shops.value?.filter((shop) => shop.isActive).length ?? 0)
</script>

<template>
  <div class="stack">
    <section class="grid">
      <div class="card metric">
        <span class="muted">Accessible shops</span>
        <strong class="metric-value">{{ shops?.length ?? 0 }}</strong>
      </div>
      <div class="card metric">
        <span class="muted">Active shops</span>
        <strong class="metric-value">{{ activeShops }}</strong>
      </div>
      <div class="card metric">
        <span class="muted">Permissions</span>
        <strong class="metric-value">{{ session.permissions.length }}</strong>
      </div>
    </section>

    <section v-if="subscription" class="panel">
      <div class="panel-head">
        <div>
          <h2>Current Subscription</h2>
          <p class="muted">{{ subscription.plan?.name || 'Plan' }} - {{ subscription.status }}</p>
        </div>
        <NuxtLink class="button" to="/subscription">Manage</NuxtLink>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Shops</h2>
          <p class="muted">Live data from the `/shops` API.</p>
        </div>
        <NuxtLink class="button" :to="customerWebUrl" external>Open shops</NuxtLink>
      </div>

      <div v-if="shopsPending" class="empty">Loading shops...</div>
      <div v-else-if="shopsError" class="error">Unable to load shops.</div>
      <div v-else-if="!shops?.length" class="empty">No shops available for this account.</div>
      <div v-else class="table">
        <div class="row head four">
          <span>Name</span>
          <span>Slug</span>
          <span>Status</span>
          <span>Open</span>
        </div>
        <div v-for="shop in shops" :key="shop.id" class="row four">
          <strong>{{ shop.name }}</strong>
          <span>{{ shop.slug }}</span>
          <span class="pill" :class="shop.isActive ? 'ok' : 'warn'">{{ shop.isActive ? 'Active' : 'Inactive' }}</span>
          <NuxtLink class="link" :to="`/shops/${shop.id}`">Details</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
