<script setup lang="ts">
import type { CreateProductRequest, UploadImageResult } from '@kmrs-app/types'

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

if (!canAccessShop.value) {
  await navigateTo('/shops')
}

const { data: categories, pending, error } = await useAsyncData(
  () => `product-create-categories-${shopId.value}`,
  () => canAccessShop.value ? client.getCategories(shopId.value) : Promise.resolve([])
)

const form = reactive({
  categoryId: '',
  name: '',
  description: '',
  price: '',
  sortOrder: 0,
  isAvailable: true
})
const selectedFile = ref<File | null>(null)
const imagePreview = ref('')
const uploadResult = ref<UploadImageResult | null>(null)
const isSaving = ref(false)
const formError = ref('')

const normalizePrice = (value: string) => {
  const normalized = value.trim()

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return ''
  }

  return Number(normalized).toFixed(2)
}

watch(categories, (items) => {
  if (!form.categoryId && items?.length) {
    form.categoryId = items[0]?.id ?? ''
  }
}, { immediate: true })

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  selectedFile.value = file
  uploadResult.value = null
  imagePreview.value = file ? URL.createObjectURL(file) : ''
}

const createProduct = async () => {
  if (!form.categoryId) {
    formError.value = 'Create a category before adding products.'
    return
  }

  formError.value = ''
  const price = normalizePrice(form.price)

  if (!price) {
    formError.value = 'Price must be a valid amount, for example 10.00.'
    return
  }

  isSaving.value = true

  try {
    if (selectedFile.value && !uploadResult.value) {
      uploadResult.value = await client.uploadImage(selectedFile.value, 'prod')
    }

    const payload: CreateProductRequest = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      price,
      sortOrder: Number(form.sortOrder) || 0,
      isAvailable: form.isAvailable,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(uploadResult.value ? { imageUrl: uploadResult.value.url, imageKey: uploadResult.value.key } : {})
    }

    await client.createProduct(shopId.value, payload)
    clearNuxtData(`catalog-${shopId.value}`)
    toast.add({
      title: 'Product created',
      description: `${payload.name} was added to the catalog.`
    })
    await navigateTo(`/shops/${shopId.value}/catalog`)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to create product.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Create Product</h2>
          <p class="muted">Upload an image and add a catalog item.</p>
        </div>
        <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`">Back to catalog</NuxtLink>
      </div>

      <div v-if="pending" class="empty">Loading categories...</div>
      <div v-else-if="error" class="error">Unable to load categories.</div>
      <div v-else-if="!categories?.length" class="empty product-create-empty">
        <div>
          <strong>Create a category first</strong>
          <p class="muted">Products need a category before they can be added to the catalog.</p>
        </div>
        <NuxtLink class="button primary" :to="`/shops/${shopId}/categories/create`">Create category</NuxtLink>
      </div>

      <form v-else class="form" @submit.prevent="createProduct">
        <div class="form-grid">
          <label class="field">
            Category
            <select v-model="form.categoryId" class="select" required :disabled="isSaving">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>
          <label class="field">
            Name
            <input v-model="form.name" class="input" type="text" maxlength="120" required :disabled="isSaving">
          </label>
          <label class="field">
            Price
            <input
              v-model="form.price"
              class="input"
              type="text"
              inputmode="decimal"
              pattern="\d+(\.\d{1,2})?"
              placeholder="10.00"
              required
              :disabled="isSaving"
            >
          </label>
          <label class="field">
            Sort order
            <input v-model.number="form.sortOrder" class="input" type="number" min="0" max="10000" :disabled="isSaving">
          </label>
        </div>

        <label class="field">
          Image
          <input class="input file-input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isSaving" @change="handleFileChange">
        </label>
        <img v-if="imagePreview" :src="imagePreview" alt="Product preview" class="upload-preview">

        <label class="field">
          Description
          <textarea v-model="form.description" class="input textarea" maxlength="1000" rows="3" :disabled="isSaving" />
        </label>
        <label class="check">
          <input v-model="form.isAvailable" type="checkbox" :disabled="isSaving">
          Available
        </label>

        <div v-if="formError" class="error">{{ formError }}</div>

        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Create product' }}
          </button>
          <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`">Cancel</NuxtLink>
        </div>
      </form>
    </section>
  </div>
</template>
