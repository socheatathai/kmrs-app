<script setup lang="ts">
import type { CreateCategoryRequest } from '@kmrs-app/types'

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

const form = reactive({
  name: '',
  sortOrder: 0
})
const isSaving = ref(false)
const formError = ref('')

const createCategory = async () => {
  const name = form.name.trim()

  if (!name) {
    formError.value = 'Category name is required.'
    return
  }

  formError.value = ''
  isSaving.value = true

  try {
    const payload: CreateCategoryRequest = {
      name,
      sortOrder: Number(form.sortOrder) || 0
    }

    await client.createCategory(shopId.value, payload)
    clearNuxtData(`catalog-${shopId.value}`)
    clearNuxtData(`product-create-categories-${shopId.value}`)
    toast.add({
      title: 'Category created',
      description: `${payload.name} is ready for products.`
    })
    await navigateTo(`/shops/${shopId.value}/catalog`)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to create category.'
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
          <h2>Create Category</h2>
          <p class="muted">Group menu items so customers can browse the catalog faster.</p>
        </div>
        <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`">Back to catalog</NuxtLink>
      </div>

      <form class="form" @submit.prevent="createCategory">
        <div class="form-grid">
          <label class="field">
            Name
            <input
              v-model="form.name"
              class="input"
              type="text"
              maxlength="120"
              placeholder="Coffee, Bakery, Brunch"
              required
              :disabled="isSaving"
            >
          </label>
          <label class="field">
            Sort order
            <input v-model.number="form.sortOrder" class="input" type="number" min="0" max="10000" :disabled="isSaving">
          </label>
        </div>

        <div v-if="formError" class="error">{{ formError }}</div>

        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Create category' }}
          </button>
          <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`">Cancel</NuxtLink>
        </div>
      </form>
    </section>
  </div>
</template>
