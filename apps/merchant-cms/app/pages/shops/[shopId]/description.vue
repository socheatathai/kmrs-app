<script setup lang="ts">
import type { UpdateShopRequest, UploadImageResult } from '@kmrs-app/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const client = useApiClient()
const auth = useAuthStore()
const toast = useToast()
const shopStore = useShopStore()
const shopId = computed(() => {
  const value = route.params.shopId
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const canAccessShop = computed(() => shopStore.canAccess(shopId.value))

if (!shopStore.select(shopId.value)) {
  await navigateTo('/shops')
}

const { data: shop, pending, error } = await useAsyncData(
  () => `shop-description-${shopId.value}`,
  () => canAccessShop.value ? client.getShop(shopId.value) : Promise.resolve(null)
)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  coverUrl: '',
  phone: '',
  address: '',
  isActive: true
})
const logoFile = ref<File | null>(null)
const coverFile = ref<File | null>(null)
const logoPreview = ref('')
const coverPreview = ref('')
const logoUpload = ref<UploadImageResult | null>(null)
const coverUpload = ref<UploadImageResult | null>(null)
const isSaving = ref(false)
const formError = ref('')

watch(shop, (value) => {
  if (!value) {
    return
  }

  form.name = value.name
  form.slug = value.slug
  form.description = value.description ?? ''
  form.logoUrl = value.logoUrl ?? ''
  form.coverUrl = value.coverUrl ?? ''
  form.phone = value.phone ?? ''
  form.address = value.address ?? ''
  form.isActive = value.isActive
  logoPreview.value = value.logoUrl ?? ''
  coverPreview.value = value.coverUrl ?? ''
}, { immediate: true })

const handleLogoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  logoFile.value = file
  logoUpload.value = null
  logoPreview.value = file ? URL.createObjectURL(file) : form.logoUrl
  formError.value = ''
}

const handleCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  coverFile.value = file
  coverUpload.value = null
  coverPreview.value = file ? URL.createObjectURL(file) : form.coverUrl
  formError.value = ''
}

const clearLogo = () => {
  logoFile.value = null
  logoUpload.value = null
  logoPreview.value = ''
  form.logoUrl = ''
  formError.value = ''
}

const clearCover = () => {
  coverFile.value = null
  coverUpload.value = null
  coverPreview.value = ''
  form.coverUrl = ''
  formError.value = ''
}

const nullableText = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const saveShop = async () => {
  formError.value = ''
  isSaving.value = true

  try {
    if (logoFile.value && !logoUpload.value) {
      logoUpload.value = await client.uploadImage(logoFile.value, 'prod')
      form.logoUrl = logoUpload.value.url
      logoPreview.value = logoUpload.value.url
    }

    if (coverFile.value && !coverUpload.value) {
      coverUpload.value = await client.uploadImage(coverFile.value, 'prod')
      form.coverUrl = coverUpload.value.url
      coverPreview.value = coverUpload.value.url
    }

    const payload: UpdateShopRequest = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: nullableText(form.description),
      logoUrl: nullableText(form.logoUrl),
      coverUrl: nullableText(form.coverUrl),
      phone: nullableText(form.phone),
      address: nullableText(form.address),
      isActive: form.isActive
    }

    await client.updateShop(shopId.value, payload)
    shop.value = await client.getShop(shopId.value)
    logoFile.value = null
    coverFile.value = null
    await auth.fetchMe()
    toast.add({
      title: 'Shop updated',
      description: `${form.name} description was saved.`
    })
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to save shop description.'
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
          <h2>{{ shop?.name || 'Shop description' }}</h2>
          <p class="muted">Public profile, contact details, and menu presentation.</p>
        </div>
        <NuxtLink class="button" :to="`/shops/${shopId}/catalog`">Catalog</NuxtLink>
      </div>

      <div v-if="pending" class="empty">Loading shop...</div>
      <div v-else-if="error" class="error">Unable to load shop.</div>
      <form v-else-if="shop" class="form" @submit.prevent="saveShop">
        <div class="description-media">
          <img v-if="coverPreview" :src="coverPreview" :alt="form.name" class="cover-image">
          <div v-else class="image-empty">No cover image</div>
          <div class="description-summary">
            <img v-if="logoPreview" :src="logoPreview" :alt="form.name" class="shop-logo">
            <div v-else class="shop-logo logo-placeholder">K</div>
            <div>
              <h3>{{ form.name || 'Shop name' }}</h3>
              <p class="muted">{{ form.description || 'No description yet.' }}</p>
            </div>
          </div>
        </div>

        <div class="form-grid">
          <label class="field">
            Name
            <input v-model="form.name" class="input" type="text" maxlength="120" required :disabled="isSaving">
          </label>
          <label class="field">
            Slug
            <input v-model="form.slug" class="input" type="text" maxlength="50" pattern="[a-z0-9-]+" required :disabled="isSaving">
          </label>
          <label class="field">
            Phone
            <input v-model="form.phone" class="input" type="text" maxlength="30" :disabled="isSaving">
          </label>
          <label class="field">
            Address
            <input v-model="form.address" class="input" type="text" maxlength="255" :disabled="isSaving">
          </label>
        </div>

        <label class="field">
          Description
          <textarea v-model="form.description" class="input textarea" maxlength="1000" rows="4" :disabled="isSaving" />
        </label>

        <div class="form-grid">
          <label class="field">
            Logo URL
            <input v-model="form.logoUrl" class="input" type="url" :disabled="isSaving" @input="logoPreview = form.logoUrl">
          </label>
          <label class="field">
            Cover URL
            <input v-model="form.coverUrl" class="input" type="url" :disabled="isSaving" @input="coverPreview = form.coverUrl">
          </label>
          <label class="field">
            Upload logo
            <input class="input file-input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isSaving" @change="handleLogoChange">
          </label>
          <label class="field">
            Upload cover
            <input class="input file-input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isSaving" @change="handleCoverChange">
          </label>
        </div>

        <div class="form-actions">
          <button class="button ghost" type="button" :disabled="isSaving" @click="clearLogo">Clear logo</button>
          <button class="button ghost" type="button" :disabled="isSaving" @click="clearCover">Clear cover</button>
        </div>

        <label class="check">
          <input v-model="form.isActive" type="checkbox" :disabled="isSaving">
          Active
        </label>

        <div v-if="formError" class="error">{{ formError }}</div>
        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save description' }}
          </button>
          <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`">Cancel</NuxtLink>
        </div>
      </form>
    </section>
  </div>
</template>
