<script setup lang="ts">
import type { QrCodeSummary } from "@kmrs-app/types";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const route = useRoute();
const client = useApiClient();
const toast = useToast();
const shopStore = useShopStore();
const session = useSessionStore();
const shopId = computed(() => {
  const value = route.params.shopId;
  return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
});
const canAccessShop = computed(() => shopStore.canAccess(shopId.value));
const canCreateQrCodes = computed(() => session.can("qrcode.create"));
const canUpdateQrCodes = computed(() => session.can("qrcode.update"));
const canDeleteQrCodes = computed(() => session.can("qrcode.delete"));

if (!shopStore.select(shopId.value)) {
  await navigateTo("/shops");
}

const { data, pending, error, refresh } = await useAsyncData(
  () => `shop-qrcodes-${shopId.value}`,
  async () => {
    if (!canAccessShop.value) {
      return null;
    }

    const [shop, qrCodes] = await Promise.all([
      client.getShop(shopId.value),
      client.getQrCodes(shopId.value),
    ]);

    return { shop, qrCodes };
  },
);

const qrCodes = computed(() => data.value?.qrCodes ?? []);
const form = reactive({ name: "" });
const editing = reactive<Record<string, string>>({});
const isCreating = ref(false);
const busyId = ref("");
const formError = ref("");

watch(
  qrCodes,
  (items) => {
    for (const item of items) {
      editing[item.id] ??= item.name ?? "";
    }
  },
  { immediate: true },
);

const createQrCode = async () => {
  formError.value = "";
  isCreating.value = true;

  try {
    await client.createQrCode(shopId.value, {
      name: form.name.trim() || undefined,
    });
    form.name = "";
    await refresh();
    toast.add({
      title: "QR code generated",
      description: "The scan code is ready for this shop.",
    });
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : "Unable to generate QR code.";
  } finally {
    isCreating.value = false;
  }
};

const updateQrCode = async (qrCode: QrCodeSummary) => {
  busyId.value = qrCode.id;

  try {
    await client.updateQrCode(shopId.value, qrCode.id, {
      name: editing[qrCode.id]?.trim() || qrCode.name || "Shop menu",
      isActive: qrCode.isActive,
    });
    await refresh();
    toast.add({
      title: "QR code updated",
      description: "The label was saved.",
    });
  } catch (error) {
    toast.add({
      title: "Unable to update QR code",
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    busyId.value = "";
  }
};

const toggleQrCode = async (qrCode: QrCodeSummary) => {
  busyId.value = qrCode.id;

  try {
    await client.updateQrCode(shopId.value, qrCode.id, {
      isActive: !qrCode.isActive,
    });
    await refresh();
  } catch (error) {
    toast.add({
      title: "Unable to change QR status",
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    busyId.value = "";
  }
};

const deleteQrCode = async (qrCode: QrCodeSummary) => {
  if (!window.confirm(`Delete ${qrCode.name || "this QR code"}?`)) {
    return;
  }

  busyId.value = qrCode.id;

  try {
    await client.deleteQrCode(shopId.value, qrCode.id);
    await refresh();
    toast.add({
      title: "QR code deleted",
      description: "The scan code was removed.",
    });
  } catch (error) {
    toast.add({
      title: "Unable to delete QR code",
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    busyId.value = "";
  }
};

const copyUrl = async (qrCode: QrCodeSummary) => {
  await navigator.clipboard.writeText(qrCode.url);
  toast.add({
    title: "Scan URL copied",
    description: qrCode.url,
  });
};

const downloadQrCode = (qrCode: QrCodeSummary) => {
  if (!qrCode.imageUrl) {
    return;
  }

  const link = document.createElement("a");
  link.href = qrCode.imageUrl;
  const filename = `${qrCode.name || data.value?.shop.name || "menu"}-qr-code`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const extension = qrCode.imageUrl.startsWith("data:image/svg+xml")
    ? "svg"
    : "png";
  link.download = `${filename}.${extension}`;
  link.click();
};
</script>

<template>
  <div class="stack">
    <section class="panel qr-page-panel">
      <div class="panel-head qr-page-head">
        <div>
          <span class="qr-eyebrow">Menu scanner</span>
          <h2>{{ data?.shop.name || "QR codes" }}</h2>
          <p class="muted">
            Generate branded scan cards that open the public menu website.
          </p>
        </div>
        <NuxtLink class="button" :to="`/shops/${shopId}/description`"
          >Shop details</NuxtLink
        >
      </div>

      <div v-if="pending" class="empty">Loading QR codes...</div>
      <div v-else-if="error" class="error">Unable to load QR codes.</div>
      <template v-else>
        <form
          v-if="canCreateQrCodes"
          class="qr-create-form"
          @submit.prevent="createQrCode"
        >
          <div class="qr-create-copy">
            <span class="i-lucide-scan-line" aria-hidden="true" />
            <div>
              <strong>New scan code</strong>
              <p class="muted">Use a location name so printed codes stay easy to track.</p>
            </div>
          </div>
          <label class="field qr-create-field">
            Label
            <input
              v-model="form.name"
              class="input"
              type="text"
              maxlength="120"
              placeholder="Counter, table tent, front door"
              :disabled="isCreating"
            />
          </label>
          <button class="button primary qr-create-button" type="submit" :disabled="isCreating">
            <span class="i-lucide-qr-code" aria-hidden="true" />
            {{ isCreating ? "Generating..." : "Generate QR code" }}
          </button>
        </form>
        <div v-if="formError" class="error">{{ formError }}</div>

        <div v-if="!qrCodes.length" class="qr-empty-state">
          <div class="qr-preview-block qr-preview-block-empty">
            <div class="qr-preview qr-preview-empty">
              <span class="i-lucide-qr-code" aria-hidden="true" />
            </div>
            <div class="qr-preview-caption">
              <span>Preview</span>
              <span class="qr-scan-dot paused" />
            </div>
          </div>
          <div class="qr-empty-copy">
            <strong>No QR codes yet</strong>
            <p class="muted">
              Add a label like Counter, Table 1, or Front Door, then generate a QR code.
              The image preview will appear here for download and testing.
            </p>
          </div>
        </div>
        <div v-else class="qr-grid">
          <article v-for="qrCode in qrCodes" :key="qrCode.id" class="qr-card">
            <div class="qr-preview-block">
              <div class="qr-preview">
                <img
                  v-if="qrCode.imageUrl"
                  :src="qrCode.imageUrl"
                  :alt="qrCode.name || 'Menu QR code'"
                />
                <span v-else class="i-lucide-qr-code" aria-hidden="true" />
              </div>
              <div class="qr-preview-caption">
                <span>Scan menu</span>
                <span class="qr-scan-dot" :class="{ paused: !qrCode.isActive }" />
              </div>
            </div>
            <div class="qr-body">
              <div class="qr-title-row">
                <div>
                  <strong>{{ qrCode.name || "Shop menu" }}</strong>
                  <p class="muted">Created for customer phone scans.</p>
                </div>
                <span class="pill" :class="qrCode.isActive ? 'ok' : 'warn'">
                  {{ qrCode.isActive ? "Active" : "Paused" }}
                </span>
              </div>
              <div class="qr-destination">
                <span class="i-lucide-link" aria-hidden="true" />
                <div>
                  <span class="qr-destination-label">Scan destination</span>
                  <a
                    class="qr-url"
                    :href="qrCode.url"
                    target="_blank"
                    rel="noreferrer"
                    >{{ qrCode.url }}</a
                  >
                </div>
              </div>

              <div v-if="canUpdateQrCodes" class="qr-edit">
                <label class="field">
                  Display label
                  <input
                    v-model="editing[qrCode.id]"
                    class="input"
                    type="text"
                    maxlength="120"
                    :disabled="busyId === qrCode.id"
                  />
                </label>
                <button
                  class="button ghost compact"
                  type="button"
                  :disabled="busyId === qrCode.id"
                  @click="updateQrCode(qrCode)"
                >
                  Save
                </button>
              </div>

              <div class="qr-actions">
                <button
                  class="button ghost compact qr-action-primary"
                  type="button"
                  @click="copyUrl(qrCode)"
                >
                  <span class="i-lucide-copy" aria-hidden="true" />
                  Copy
                </button>
                <button
                  class="button ghost compact qr-action-primary"
                  type="button"
                  :disabled="!qrCode.imageUrl"
                  @click="downloadQrCode(qrCode)"
                >
                  <span class="i-lucide-download" aria-hidden="true" />
                  Download
                </button>
                <a
                  class="button ghost compact qr-action-primary"
                  :href="qrCode.url"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span class="i-lucide-external-link" aria-hidden="true" />
                  Open
                </a>
                <button
                  v-if="canUpdateQrCodes"
                  class="button ghost compact"
                  type="button"
                  :disabled="busyId === qrCode.id"
                  @click="toggleQrCode(qrCode)"
                >
                  {{ qrCode.isActive ? "Pause" : "Activate" }}
                </button>
                <button
                  v-if="canDeleteQrCodes"
                  class="button ghost compact danger"
                  type="button"
                  :disabled="busyId === qrCode.id"
                  @click="deleteQrCode(qrCode)"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>
  </div>
</template>
