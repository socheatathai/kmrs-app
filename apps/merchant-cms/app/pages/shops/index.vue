<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const shopStore = useShopStore()
const { data: shops, pending, error, refresh } = await useAsyncData(
  () => `shops-${auth.user?.id ?? 'anonymous'}`,
  () => client.getShops()
)

watch(shops, () => shopStore.initialize(), { immediate: true })
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Shops</h2>
        <p class="muted">Select a shop, review settings, and open catalog tools.</p>
      </div>
      <button class="button" type="button" @click="refresh()">Refresh</button>
    </div>

    <div v-if="pending" class="empty">Loading shops...</div>
    <div v-else-if="error" class="error">Unable to load shops.</div>
    <div v-else-if="!shops?.length" class="empty">No shops available.</div>
    <div v-else class="table">
      <div class="row head four">
        <span>Name</span>
        <span>Slug</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div v-for="item in shops" :key="item.id" class="row four">
        <strong>{{ item.name }}</strong>
        <span>{{ item.slug }}</span>
        <span class="pill" :class="item.isActive ? 'ok' : 'warn'">{{ item.isActive ? 'Active' : 'Inactive' }}</span>
        <div>
          <button class="button ghost" type="button" @click="shopStore.select(item.id)">Select</button>
          <NuxtLink class="button" :to="`/shops/${item.id}`">Open</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
