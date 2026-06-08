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
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

watch(shops, () => shopStore.initialize(), { immediate: true })
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Shops</h2>
        <p class="muted">Choose the shop you want to manage.</p>
      </div>
      <button class="button" type="button" @click="refresh()">Refresh</button>
    </div>

    <div v-if="pending" class="empty">Loading shops...</div>
    <div v-else-if="error" class="error">Unable to load shops.</div>
    <div v-else-if="!shops?.length" class="empty">No shops available.</div>
    <DataTable v-else row-class="four" :columns="columns" :rows="shops">
      <template #cell-name="{ row }">
        <strong>{{ row.name }}</strong>
      </template>
      <template #cell-status="{ row }">
        <span class="pill" :class="row.isActive ? 'ok' : 'warn'">{{ row.isActive ? 'Active' : 'Inactive' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="actions">
          <button
            class="button ghost"
            type="button"
            :disabled="shopStore.selectedShopId === row.id"
            @click="shopStore.select(String(row.id))"
          >
            {{ shopStore.selectedShopId === row.id ? 'Selected' : 'Select' }}
          </button>
          <NuxtLink class="button" :to="`/shops/${row.id}`">Open</NuxtLink>
        </div>
      </template>
    </DataTable>
  </section>
</template>
