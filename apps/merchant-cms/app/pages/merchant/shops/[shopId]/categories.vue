<script setup lang="ts">
const client = useApiClient()
const { shopId, validateShopRoute } = useShopRouteContext()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'category.view'
})

await validateShopRoute()

const { data: categories, pending, error } = await useAsyncData(
  () => `categories-${shopId.value}`,
  () => client.getCategories(shopId.value)
)
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Categories</h3>
        <p class="muted">Menu structure for the selected shop.</p>
      </div>
    </div>

    <div v-if="pending" class="state-card">Loading categories...</div>
    <div v-else-if="error" class="state-card error">Unable to load categories.</div>
    <div v-else-if="!categories?.length" class="state-card">No categories yet.</div>
    <div v-else class="table">
      <div class="table-row header three">
        <span>Name</span>
        <span>Sort Order</span>
        <span>Updated</span>
      </div>
      <div v-for="category in categories" :key="category.id" class="table-row three">
        <span>{{ category.name }}</span>
        <span>{{ category.sortOrder }}</span>
        <span>{{ new Date(category.updatedAt).toLocaleDateString() }}</span>
      </div>
    </div>
  </section>
</template>
