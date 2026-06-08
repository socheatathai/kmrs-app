<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const client = useApiClient()
const toast = useToast()
const shopStore = useShopStore()
const shopId = computed(() => {
  const value = route.params.shopId
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const canAccessShop = computed(() => shopStore.canAccess(shopId.value))

const productColumns = [
  { key: 'product', label: 'Product', sortable: true, sortKey: 'name' },
  { key: 'category', label: 'Category', sortable: true, valueKey: 'category.name' },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'status', label: 'Status', sortable: true, valueKey: 'isAvailable' },
  { key: 'actions', label: 'Actions', class: 'cell-actions' }
]

if (!canAccessShop.value) {
  await navigateTo('/shops')
}

const { data, pending, error, refresh } = await useAsyncData(
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

const categories = computed(() => data.value?.categories ?? [])
const products = computed(() => data.value?.products ?? [])
const isDeleting = ref('')
const deleteCandidate = ref<{ id: string, name: string } | null>(null)
const productFilters = computed(() => [
  {
    key: 'category.name',
    label: 'categories',
    options: categories.value.map((category) => ({ label: category.name, value: category.name }))
  },
  {
    key: 'isAvailable',
    label: 'status',
    options: [
      { label: 'Available', value: 'true' },
      { label: 'Hidden', value: 'false' }
    ]
  }
])

const formatPrice = (value: string) => `$${Number(value).toFixed(2)}`

const askDeleteProduct = (productId: string, productName: string) => {
  deleteCandidate.value = { id: productId, name: productName }
}

const cancelDelete = () => {
  deleteCandidate.value = null
}

const confirmDeleteProduct = async () => {
  if (!deleteCandidate.value) {
    return
  }

  const { id: productId, name: productName } = deleteCandidate.value
  isDeleting.value = productId

  try {
    await client.deleteProduct(shopId.value, productId)
    await refresh()
    deleteCandidate.value = null
    toast.add({
      title: 'Product deleted',
      description: `${productName} was removed from the catalog.`
    })
  } catch (error) {
    toast.add({
      title: 'Unable to delete product',
      description: error instanceof Error ? error.message : 'Please try again.'
    })
  } finally {
    isDeleting.value = ''
  }
}
</script>

<template>
  <div class="stack">
    <div v-if="pending" class="empty">Loading catalog...</div>
    <div v-else-if="error" class="error">Unable to load catalog.</div>

    <section v-if="!pending && !error" class="panel">
      <div class="panel-head">
        <div>
          <h2>Products</h2>
          <p class="muted">Manage menu items, categories, prices, and visibility.</p>
        </div>
        <NuxtLink class="button primary" :to="`/shops/${shopId}/products/create`">Create product</NuxtLink>
      </div>
      <DataTable
        row-class="products-table"
        :columns="productColumns"
        :rows="products"
        :filters="productFilters"
        :searchable-keys="['name', 'description', 'category.name', 'price']"
        :page-size-options="[10, 25, 50]"
        :initial-page-size="10"
        search-placeholder="Search products"
      >
        <template #cell-product="{ row }">
          <div class="product-cell">
            <img v-if="row.imageUrl" :src="String(row.imageUrl)" :alt="String(row.name)" class="product-thumb">
            <div>
              <strong>{{ row.name }}</strong>
              <p v-if="row.description" class="muted truncate">{{ row.description }}</p>
            </div>
          </div>
        </template>
        <template #cell-category="{ row }">
          {{ row.category?.name || 'Unassigned' }}
        </template>
        <template #cell-price="{ row }">
          {{ formatPrice(String(row.price)) }}
        </template>
        <template #cell-status="{ row }">
          <span class="pill" :class="row.isAvailable ? 'ok' : 'warn'">{{ row.isAvailable ? 'Available' : 'Hidden' }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="table-actions">
            <NuxtLink class="button ghost compact" :to="`/shops/${shopId}/products/${row.id}`">Edit</NuxtLink>
            <button
              class="button ghost compact danger"
              type="button"
              :disabled="isDeleting === row.id"
              @click="askDeleteProduct(String(row.id), String(row.name))"
            >
              {{ isDeleting === row.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </template>
      </DataTable>
    </section>

    <Teleport to="body">
      <div v-if="deleteCandidate" class="modal-wrap" role="presentation">
        <button class="modal-backdrop" type="button" aria-label="Cancel delete" @click="cancelDelete" />
        <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title">
          <div>
            <h2 id="delete-product-title">Delete product?</h2>
            <p class="muted">{{ deleteCandidate.name }} will be removed from this catalog.</p>
          </div>
          <div class="form-actions confirm-actions">
            <button class="button ghost" type="button" :disabled="Boolean(isDeleting)" @click="cancelDelete">Cancel</button>
            <button class="button danger-solid" type="button" :disabled="Boolean(isDeleting)" @click="confirmDeleteProduct">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>
