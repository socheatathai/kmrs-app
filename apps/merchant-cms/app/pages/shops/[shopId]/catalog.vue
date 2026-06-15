<script setup lang="ts">
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
const canAccessShop = computed(() => shopStore.canAccess(shopId.value));

const productColumns = [
  { key: "product", label: "Product", sortable: true, sortKey: "name" },
  {
    key: "category",
    label: "Category",
    sortable: true,
    valueKey: "category.name",
  },
  { key: "price", label: "Price", sortable: true },
  { key: "status", label: "Status", sortable: true, valueKey: "isAvailable" },
  { key: "actions", label: "Actions", class: "cell-actions" },
];
const categoryColumns = [
  { key: "name", label: "Category", sortable: true },
  { key: "sortOrder", label: "Sort order", sortable: true },
  { key: "productCount", label: "Products", sortable: true },
  { key: "status", label: "Status", sortable: true, valueKey: "isActive" },
  { key: "actions", label: "Actions", class: "cell-actions" },
];

if (!canAccessShop.value) {
  await navigateTo("/shops");
}

const { data, pending, error, refresh } = await useAsyncData(
  () => `catalog-${shopId.value}`,
  async () => {
    if (!canAccessShop.value) {
      return null;
    }

    const [categories, products, qrCodeCount] = await Promise.all([
      client.getCategories(shopId.value),
      client.getProducts(shopId.value),
      client.getQrCodeCount(shopId.value),
    ]);

    return { categories, products, qrCodeCount: qrCodeCount.count };
  },
);

const categories = computed(() => data.value?.categories ?? []);
const products = computed(() => data.value?.products ?? []);
const qrCodeCount = computed(() => data.value?.qrCodeCount ?? 0);
const activeTab = ref<"products" | "categories">("products");
const isDeleting = ref("");
const statusUpdating = ref("");
const isSavingCategory = ref(false);
const deleteCandidate = ref<{
  type: "product" | "category";
  id: string;
  name: string;
} | null>(null);
const statusCandidate = ref<{
  type: "product" | "category";
  id: string;
  name: string;
  currentStatus: boolean;
  nextStatus: boolean;
} | null>(null);
const editingCategory = ref<{
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
} | null>(null);
const categoryFormError = ref("");
const availableProducts = computed(
  () => products.value.filter((product) => product.isAvailable).length,
);
const hiddenProducts = computed(() =>
  Math.max(0, products.value.length - availableProducts.value),
);
const categoryRows = computed(() =>
  categories.value.map((category) => ({
    ...category,
    productCount: products.value.filter(
      (product) => product.categoryId === category.id,
    ).length,
  })),
);
const activeCreateLink = computed(() =>
  activeTab.value === "products"
    ? `/shops/${shopId.value}/products/create`
    : `/shops/${shopId.value}/categories/create`,
);
const activeCreateLabel = computed(() =>
  activeTab.value === "products" ? "Create product" : "Create category",
);
const catalogStats = computed(() => [
  { label: "Products", value: products.value.length },
  { label: "Categories", value: categories.value.length },
  { label: "Available", value: availableProducts.value },
  { label: "Hidden", value: hiddenProducts.value },
  { label: "QR codes", value: qrCodeCount.value },
]);
const productFilters = computed(() => [
  {
    key: "category.name",
    label: "categories",
    options: categories.value.map((category) => ({
      label: category.name,
      value: category.name,
    })),
  },
  {
    key: "isAvailable",
    label: "status",
    options: [
      { label: "Available", value: "true" },
      { label: "Disabled", value: "false" },
    ],
  },
]);
const categoryFilters = [
  {
    key: "isActive",
    label: "status",
    options: [
      { label: "Available", value: "true" },
      { label: "Disabled", value: "false" },
    ],
  },
];

const formatPrice = (value: string) => `$${Number(value).toFixed(2)}`;

const askUpdateProductStatus = (
  productId: string,
  productName: string,
  currentStatus: boolean,
) => {
  statusCandidate.value = {
    type: "product",
    id: productId,
    name: productName,
    currentStatus,
    nextStatus: !currentStatus,
  };
};

const askUpdateCategoryStatus = (
  categoryId: string,
  categoryName: string,
  currentStatus: boolean,
) => {
  statusCandidate.value = {
    type: "category",
    id: categoryId,
    name: categoryName,
    currentStatus,
    nextStatus: !currentStatus,
  };
};

const cancelStatusUpdate = () => {
  statusCandidate.value = null;
};

const updateProductStatus = async () => {
  if (!statusCandidate.value || statusCandidate.value.type !== "product") {
    return;
  }

  const {
    id: productId,
    name: productName,
    nextStatus: isAvailable,
  } = statusCandidate.value;
  statusUpdating.value = `product-${productId}`;

  try {
    await client.updateProduct(shopId.value, productId, { isAvailable });
    await refresh();
    toast.add({
      title: "Product status updated",
      description: `${productName} is now ${isAvailable ? "available" : "disabled"}.`,
    });
    statusCandidate.value = null;
  } catch (error) {
    await refresh();
    toast.add({
      title: "Unable to update product",
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    statusUpdating.value = "";
  }
};

const updateCategoryStatus = async () => {
  if (!statusCandidate.value || statusCandidate.value.type !== "category") {
    return;
  }

  const {
    id: categoryId,
    name: categoryName,
    nextStatus: isActive,
  } = statusCandidate.value;
  statusUpdating.value = `category-${categoryId}`;

  try {
    await client.updateCategory(shopId.value, categoryId, { isActive });
    await refresh();
    clearNuxtData(`product-create-categories-${shopId.value}`);
    toast.add({
      title: "Category status updated",
      description: `${categoryName} is now ${isActive ? "available" : "disabled"}.`,
    });
    statusCandidate.value = null;
  } catch (error) {
    await refresh();
    toast.add({
      title: "Unable to update category",
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    statusUpdating.value = "";
  }
};

const askDeleteProduct = (productId: string, productName: string) => {
  deleteCandidate.value = { type: "product", id: productId, name: productName };
};

const askDeleteCategory = (categoryId: string, categoryName: string) => {
  deleteCandidate.value = {
    type: "category",
    id: categoryId,
    name: categoryName,
  };
};

const cancelDelete = () => {
  deleteCandidate.value = null;
};

const beginEditCategory = (category: {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}) => {
  categoryFormError.value = "";
  editingCategory.value = {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
};

const cancelEditCategory = () => {
  editingCategory.value = null;
  categoryFormError.value = "";
};

const saveCategory = async () => {
  if (!editingCategory.value) {
    return;
  }

  const name = editingCategory.value.name.trim();

  if (!name) {
    categoryFormError.value = "Category name is required.";
    return;
  }

  isSavingCategory.value = true;
  categoryFormError.value = "";

  try {
    await client.updateCategory(shopId.value, editingCategory.value.id, {
      name,
      sortOrder: Number(editingCategory.value.sortOrder) || 0,
      isActive: editingCategory.value.isActive,
    });
    await refresh();
    clearNuxtData(`product-create-categories-${shopId.value}`);
    toast.add({
      title: "Category updated",
      description: `${name} was saved.`,
    });
    cancelEditCategory();
  } catch (error) {
    categoryFormError.value =
      error instanceof Error ? error.message : "Unable to update category.";
  } finally {
    isSavingCategory.value = false;
  }
};

const confirmDeleteProduct = async () => {
  if (!deleteCandidate.value || deleteCandidate.value.type !== "product") {
    return;
  }

  const { id: productId, name: productName } = deleteCandidate.value;
  isDeleting.value = productId;

  try {
    await client.deleteProduct(shopId.value, productId);
    await refresh();
    deleteCandidate.value = null;
    toast.add({
      title: "Product deleted",
      description: `${productName} was removed from the catalog.`,
    });
  } catch (error) {
    toast.add({
      title: "Unable to delete product",
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    isDeleting.value = "";
  }
};

const confirmDeleteCategory = async () => {
  if (!deleteCandidate.value || deleteCandidate.value.type !== "category") {
    return;
  }

  const { id: categoryId, name: categoryName } = deleteCandidate.value;
  isDeleting.value = categoryId;

  try {
    await client.deleteCategory(shopId.value, categoryId);
    await refresh();
    clearNuxtData(`product-create-categories-${shopId.value}`);
    deleteCandidate.value = null;
    toast.add({
      title: "Category deleted",
      description: `${categoryName} was removed from the catalog.`,
    });
  } catch (error) {
    toast.add({
      title: "Unable to delete category",
      description:
        error instanceof Error
          ? error.message
          : "Only empty categories can be deleted.",
    });
  } finally {
    isDeleting.value = "";
  }
};
</script>

<template>
  <div class="stack">
    <div v-if="pending" class="empty">Loading catalog...</div>
    <div v-else-if="error" class="error">Unable to load catalog.</div>

    <section v-if="!pending && !error" class="panel catalog-panel">
      <div class="catalog-head">
        <div class="catalog-title-block">
          <span class="catalog-kicker">Catalog</span>
          <h2>Menu management</h2>
          <p class="muted">
            Keep products, categories, prices, visibility, and shop QR access in
            one focused workspace.
          </p>
        </div>
      </div>

      <dl class="catalog-summary" aria-label="Catalog summary">
        <div
          v-for="stat in catalogStats"
          :key="stat.label"
          class="catalog-summary-item"
        >
          <dt>{{ stat.label }}</dt>
          <dd>{{ stat.value }}</dd>
        </div>
      </dl>

      <div class="catalog-table-block">
        <div class="catalog-toolbar">
          <div
            class="tabs catalog-tabs"
            role="tablist"
            aria-label="Catalog views"
          >
            <button
              class="tab"
              :class="{ active: activeTab === 'products' }"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'products'"
              aria-controls="catalog-products-panel"
              @click="activeTab = 'products'"
            >
              Products
            </button>
            <button
              class="tab"
              :class="{ active: activeTab === 'categories' }"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'categories'"
              aria-controls="catalog-categories-panel"
              @click="activeTab = 'categories'"
            >
              Categories
            </button>
          </div>
          <NuxtLink
            class="button primary catalog-create-button"
            :to="activeCreateLink"
          >
            {{ activeCreateLabel }}
          </NuxtLink>
        </div>

        <div class="catalog-section-head">
          <div>
            <h3>{{ activeTab === "products" ? "Products" : "Categories" }}</h3>
            <p class="muted">
              {{
                activeTab === "products"
                  ? "Search, filter, and update menu items from the table below."
                  : "Search, sort, and update category order from the table below."
              }}
            </p>
          </div>
        </div>

        <div
          v-show="activeTab === 'products'"
          id="catalog-products-panel"
          class="tab-panel"
          role="tabpanel"
        >
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
                <img
                  v-if="row.imageUrl"
                  :src="String(row.imageUrl)"
                  :alt="String(row.name)"
                  class="product-thumb"
                />
                <div>
                  <strong>{{ row.name }}</strong>
                  <p v-if="row.description" class="muted truncate">
                    {{ row.description }}
                  </p>
                </div>
              </div>
            </template>
            <template #cell-category="{ row }">
              {{ row.category?.name || "Unassigned" }}
            </template>
            <template #cell-price="{ row }">
              {{ formatPrice(String(row.price)) }}
            </template>
            <template #cell-status="{ row }">
              <button
                class="status-toggle"
                :class="row.isAvailable ? 'available' : 'disabled'"
                type="button"
                :disabled="statusUpdating === `product-${row.id}`"
                @click="
                  askUpdateProductStatus(
                    String(row.id),
                    String(row.name),
                    Boolean(row.isAvailable),
                  )
                "
              >
                {{ row.isAvailable ? "Available" : "Disabled" }}
              </button>
            </template>
            <template #cell-actions="{ row }">
              <div class="table-actions">
                <NuxtLink
                  class="button ghost compact"
                  :to="`/shops/${shopId}/products/${row.id}`"
                  >Edit</NuxtLink
                >
                <button
                  class="button ghost compact danger"
                  type="button"
                  :disabled="isDeleting === row.id"
                  @click="askDeleteProduct(String(row.id), String(row.name))"
                >
                  {{ isDeleting === row.id ? "Deleting..." : "Delete" }}
                </button>
              </div>
            </template>
          </DataTable>
        </div>

        <DataTable
          v-show="activeTab === 'categories'"
          id="catalog-categories-panel"
          class="tab-panel"
          role="tabpanel"
          row-class="categories-table"
          :columns="categoryColumns"
          :rows="categoryRows"
          :filters="categoryFilters"
          :searchable-keys="['name', 'sortOrder', 'productCount', 'isActive']"
          :page-size-options="[10, 25, 50]"
          :initial-page-size="10"
          search-placeholder="Search categories"
        >
          <template #cell-status="{ row }">
            <button
              class="status-toggle"
              :class="row.isActive ? 'available' : 'disabled'"
              type="button"
              :disabled="statusUpdating === `category-${row.id}`"
              @click="
                askUpdateCategoryStatus(
                  String(row.id),
                  String(row.name),
                  Boolean(row.isActive),
                )
              "
            >
              {{ row.isActive ? "Available" : "Disabled" }}
            </button>
          </template>
          <template #cell-actions="{ row }">
            <div class="table-actions">
              <button
                class="button ghost compact"
                type="button"
                @click="beginEditCategory(row)"
              >
                Edit
              </button>
              <button
                class="button ghost compact danger"
                type="button"
                :disabled="
                  isDeleting === row.id || Number(row.productCount) > 0
                "
                @click="askDeleteCategory(String(row.id), String(row.name))"
              >
                {{ isDeleting === row.id ? "Deleting..." : "Delete" }}
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="editingCategory" class="modal-wrap" role="presentation">
        <button
          class="modal-backdrop"
          type="button"
          aria-label="Cancel edit"
          @click="cancelEditCategory"
        />
        <section
          class="confirm-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-category-title"
        >
          <div>
            <h2 id="edit-category-title">Edit category</h2>
            <p class="muted">
              Update the category name, sort order, and visibility.
            </p>
          </div>

          <form class="form" @submit.prevent="saveCategory">
            <label class="field">
              Name
              <input
                v-model="editingCategory.name"
                class="input"
                type="text"
                maxlength="120"
                required
                :disabled="isSavingCategory"
              />
            </label>
            <label class="field">
              Sort order
              <input
                v-model.number="editingCategory.sortOrder"
                class="input"
                type="number"
                min="0"
                max="10000"
                :disabled="isSavingCategory"
              />
            </label>
            <label class="check">
              <input
                v-model="editingCategory.isActive"
                type="checkbox"
                :disabled="isSavingCategory"
              />
              Active
            </label>

            <div v-if="categoryFormError" class="error">
              {{ categoryFormError }}
            </div>

            <div class="form-actions confirm-actions">
              <button
                class="button ghost"
                type="button"
                :disabled="isSavingCategory"
                @click="cancelEditCategory"
              >
                Cancel
              </button>
              <button
                class="button primary"
                type="submit"
                :disabled="isSavingCategory"
              >
                {{ isSavingCategory ? "Saving..." : "Save category" }}
              </button>
            </div>
          </form>
        </section>
      </div>

      <div v-if="deleteCandidate" class="modal-wrap" role="presentation">
        <button
          class="modal-backdrop"
          type="button"
          aria-label="Cancel delete"
          @click="cancelDelete"
        />
        <section
          class="confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-item-title"
        >
          <div>
            <h2 id="delete-item-title">Delete {{ deleteCandidate.type }}?</h2>
            <p class="muted">
              {{ deleteCandidate.name }} will be removed from this catalog.
            </p>
          </div>
          <div class="form-actions confirm-actions">
            <button
              class="button ghost"
              type="button"
              :disabled="Boolean(isDeleting)"
              @click="cancelDelete"
            >
              Cancel
            </button>
            <button
              class="button danger-solid"
              type="button"
              :disabled="Boolean(isDeleting)"
              @click="
                deleteCandidate.type === 'product'
                  ? confirmDeleteProduct()
                  : confirmDeleteCategory()
              "
            >
              {{ isDeleting ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </section>
      </div>

      <div v-if="statusCandidate" class="modal-wrap" role="presentation">
        <button
          class="modal-backdrop"
          type="button"
          aria-label="Cancel status update"
          @click="cancelStatusUpdate"
        />
        <section
          class="confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="status-update-title"
        >
          <div>
            <h2 id="status-update-title">Update status?</h2>
            <p class="muted">
              {{ statusCandidate.name }} will be marked as
              {{ statusCandidate.nextStatus ? "Available" : "Disabled" }}.
            </p>
          </div>
          <div class="status-change-preview">
            <span
              class="status-badge"
              :class="statusCandidate.currentStatus ? 'available' : 'disabled'"
            >
              {{ statusCandidate.currentStatus ? "Available" : "Disabled" }}
            </span>
            <span class="status-arrow">to</span>
            <span
              class="status-badge"
              :class="statusCandidate.nextStatus ? 'available' : 'disabled'"
            >
              {{ statusCandidate.nextStatus ? "Available" : "Disabled" }}
            </span>
          </div>
          <div class="form-actions confirm-actions">
            <button
              class="button ghost"
              type="button"
              :disabled="Boolean(statusUpdating)"
              @click="cancelStatusUpdate"
            >
              Cancel
            </button>
            <button
              class="button primary"
              type="button"
              :disabled="Boolean(statusUpdating)"
              @click="
                statusCandidate.type === 'product'
                  ? updateProductStatus()
                  : updateCategoryStatus()
              "
            >
              {{ statusUpdating ? "Updating..." : "Update status" }}
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>
