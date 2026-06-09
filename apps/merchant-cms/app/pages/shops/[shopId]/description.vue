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
let logoObjectUrl = ''
let coverObjectUrl = ''

const setLogoPreview = (value: string) => {
  if (logoObjectUrl) {
    URL.revokeObjectURL(logoObjectUrl)
    logoObjectUrl = ''
  }

  logoPreview.value = value
}

const setCoverPreview = (value: string) => {
  if (coverObjectUrl) {
    URL.revokeObjectURL(coverObjectUrl)
    coverObjectUrl = ''
  }

  coverPreview.value = value
}

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
  setLogoPreview(value.logoUrl ?? '')
  setCoverPreview(value.coverUrl ?? '')
}, { immediate: true })

const handleLogoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  logoFile.value = file
  logoUpload.value = null

  if (file) {
    setLogoPreview('')
    logoObjectUrl = URL.createObjectURL(file)
    logoPreview.value = logoObjectUrl
  } else {
    setLogoPreview(form.logoUrl)
  }

  formError.value = ''
}

const handleCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  coverFile.value = file
  coverUpload.value = null

  if (file) {
    setCoverPreview('')
    coverObjectUrl = URL.createObjectURL(file)
    coverPreview.value = coverObjectUrl
  } else {
    setCoverPreview(form.coverUrl)
  }

  formError.value = ''
}

const clearLogo = () => {
  logoFile.value = null
  logoUpload.value = null
  setLogoPreview('')
  form.logoUrl = ''
  formError.value = ''
}

const clearCover = () => {
  coverFile.value = null
  coverUpload.value = null
  setCoverPreview('')
  form.coverUrl = ''
  formError.value = ''
}

onBeforeUnmount(() => {
  if (logoObjectUrl) {
    URL.revokeObjectURL(logoObjectUrl)
  }

  if (coverObjectUrl) {
    URL.revokeObjectURL(coverObjectUrl)
  }
})

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
      setLogoPreview(logoUpload.value.url)
    }

    if (coverFile.value && !coverUpload.value) {
      coverUpload.value = await client.uploadImage(coverFile.value, 'prod')
      form.coverUrl = coverUpload.value.url
      setCoverPreview(coverUpload.value.url)
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
            <input v-model="form.logoUrl" class="input" type="url" :disabled="isSaving" @input="setLogoPreview(form.logoUrl)">
          </label>
          <label class="field">
            Cover URL
            <input v-model="form.coverUrl" class="input" type="url" :disabled="isSaving" @input="setCoverPreview(form.coverUrl)">
          </label>
        </div>

        <div class="upload-preview-grid">
          <label class="field upload-preview-field">
            Upload logo
            <input class="input file-input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isSaving" @change="handleLogoChange">
            <div class="inline-image-preview logo-inline-preview">
              <img v-if="logoPreview" :src="logoPreview" :alt="`${form.name} logo preview`">
              <span v-else>No logo preview</span>
            </div>
            <p v-if="logoFile" class="muted upload-file-name">{{ logoFile.name }}</p>
          </label>
          <label class="field upload-preview-field">
            Upload cover
            <input class="input file-input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isSaving" @change="handleCoverChange">
            <div class="inline-image-preview cover-inline-preview">
              <img v-if="coverPreview" :src="coverPreview" :alt="`${form.name} cover preview`">
              <span v-else>No cover preview</span>
            </div>
            <p v-if="coverFile" class="muted upload-file-name">{{ coverFile.name }}</p>
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
