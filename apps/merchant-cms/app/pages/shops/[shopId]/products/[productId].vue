<script setup lang="ts">
import type { UpdateProductRequest, UploadImageResult } from "@kmrs-app/types";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const route = useRoute();
const client = useApiClient();
const toast = useToast();
const shopStore = useShopStore();
const shopId = computed(() => {
  const value = route.params.shopId;
  return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
});
const productId = computed(() => {
  const value = route.params.productId;
  return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
});
const canAccessShop = computed(() => shopStore.canAccess(shopId.value));

if (!canAccessShop.value) {
  await navigateTo("/shops");
}

const { data, pending, error, refresh } = await useAsyncData(
  () => `product-edit-${shopId.value}-${productId.value}`,
  async () => {
    if (!canAccessShop.value) {
      return null;
    }

    const [categories, product] = await Promise.all([
      client.getCategories(shopId.value),
      client.getProduct(shopId.value, productId.value),
    ]);

    return { categories, product };
  },
);

const categories = computed(() => data.value?.categories ?? []);
const product = computed(() => data.value?.product ?? null);
const form = reactive({
  categoryId: "",
  name: "",
  description: "",
  price: "",
  sortOrder: 0,
  imageUrl: "",
  imageKey: "",
  isAvailable: true,
});
const selectedFile = ref<File | null>(null);
const imagePreview = ref("");
const uploadResult = ref<UploadImageResult | null>(null);
const isSaving = ref(false);
const formError = ref("");

watch(
  product,
  (value) => {
    if (!value) {
      return;
    }

    form.categoryId = value.categoryId;
    form.name = value.name;
    form.description = value.description ?? "";
    form.price = value.price;
    form.sortOrder = value.sortOrder;
    form.imageUrl = value.imageUrl ?? "";
    form.imageKey = value.imageKey ?? "";
    form.isAvailable = value.isAvailable;
    imagePreview.value = value.imageUrl ?? "";
  },
  { immediate: true },
);

const normalizePrice = (value: string) => {
  const normalized = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return "";
  }

  return Number(normalized).toFixed(2);
};

const nullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  selectedFile.value = file;
  uploadResult.value = null;
  imagePreview.value = file ? URL.createObjectURL(file) : form.imageUrl;
};

const clearImage = () => {
  selectedFile.value = null;
  uploadResult.value = null;
  imagePreview.value = "";
  form.imageUrl = "";
  form.imageKey = "";
};

const updateProduct = async () => {
  if (!form.categoryId) {
    formError.value = "Select a category first.";
    return;
  }

  const price = normalizePrice(form.price);

  if (!price) {
    formError.value = "Price must be a valid amount, for example 10.00.";
    return;
  }

  formError.value = "";
  isSaving.value = true;

  try {
    if (selectedFile.value && !uploadResult.value) {
      uploadResult.value = await client.uploadImage(selectedFile.value, "prod");
      form.imageUrl = uploadResult.value.url;
      form.imageKey = uploadResult.value.key;
      imagePreview.value = uploadResult.value.url;
    }

    const payload: UpdateProductRequest = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      price,
      sortOrder: Number(form.sortOrder) || 0,
      isAvailable: form.isAvailable,
      description: nullableText(form.description),
      imageUrl: nullableText(form.imageUrl),
      imageKey: nullableText(form.imageKey),
    };

    await client.updateProduct(shopId.value, productId.value, payload);
    clearNuxtData(`catalog-${shopId.value}`);
    selectedFile.value = null;
    toast.add({
      title: "Product updated",
      description: `${payload.name} was saved.`,
    });
    await navigateTo(`/shops/${shopId.value}/catalog`);
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : "Unable to update product.";
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Edit Product</h2>
          <p class="muted">
            Update catalog item details, image, and availability.
          </p>
        </div>
        <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`"
          >Back to catalog</NuxtLink
        >
      </div>

      <div v-if="pending" class="empty">Loading product...</div>
      <div v-else-if="error" class="error">Unable to load product.</div>
      <div v-else-if="!product" class="empty">Product not found.</div>

      <form v-else class="form" @submit.prevent="updateProduct">
        <div class="form-grid">
          <label class="field">
            Category
            <select
              v-model="form.categoryId"
              class="select"
              required
              :disabled="isSaving"
            >
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </label>
          <label class="field">
            Name
            <input
              v-model="form.name"
              class="input"
              type="text"
              maxlength="120"
              required
              :disabled="isSaving"
            />
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
            />
          </label>
          <label class="field">
            Sort order
            <input
              v-model.number="form.sortOrder"
              class="input"
              type="number"
              min="0"
              max="10000"
              :disabled="isSaving"
            />
          </label>
        </div>

        <label class="field">
          Image URL
          <input
            v-model="form.imageUrl"
            class="input"
            type="url"
            :disabled="isSaving"
            @input="imagePreview = form.imageUrl"
          />
        </label>
        <label class="field">
          Upload image
          <input
            class="input file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="isSaving"
            @change="handleFileChange"
          />
        </label>
        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="Product preview"
          class="upload-preview"
        />

        <label class="field">
          Description
          <textarea
            v-model="form.description"
            class="input textarea"
            maxlength="1000"
            rows="3"
            :disabled="isSaving"
          />
        </label>
        <label class="check">
          <input
            v-model="form.isAvailable"
            type="checkbox"
            :disabled="isSaving"
          />
          Available
        </label>

        <div v-if="formError" class="error">{{ formError }}</div>

        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save product" }}
          </button>
          <button
            class="button ghost"
            type="button"
            :disabled="isSaving"
            @click="clearImage"
          >
            Clear image
          </button>
          <NuxtLink class="button ghost" :to="`/shops/${shopId}/catalog`"
            >Cancel</NuxtLink
          >
        </div>
      </form>
    </section>
  </div>
</template>
