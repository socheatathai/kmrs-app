<script setup lang="ts">
const client = useApiClient()
const { shopId, validateShopRoute } = useShopRouteContext()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'qrcode.view'
})

await validateShopRoute()

const { data: qrCodes, pending, error } = await useAsyncData(
  () => `qrcodes-${shopId.value}`,
  () => client.getQrCodes(shopId.value)
)
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>QR Codes</h3>
        <p class="muted">Published menu entry points for the selected shop.</p>
      </div>
    </div>

    <div v-if="pending" class="state-card">Loading QR codes...</div>
    <div v-else-if="error" class="state-card error">Unable to load QR codes.</div>
    <div v-else-if="!qrCodes?.length" class="state-card">No QR codes yet.</div>
    <div v-else class="table">
      <div class="table-row header four">
        <span>Name</span>
        <span>URL</span>
        <span>Status</span>
        <span>Updated</span>
      </div>
      <div v-for="qrCode in qrCodes" :key="qrCode.id" class="table-row four">
        <span>{{ qrCode.name || 'Menu QR' }}</span>
        <span class="truncate">{{ qrCode.url }}</span>
        <span class="pill" :class="qrCode.isActive ? 'ok' : 'warn'">{{ qrCode.isActive ? 'Active' : 'Inactive' }}</span>
        <span>{{ new Date(qrCode.updatedAt).toLocaleDateString() }}</span>
      </div>
    </div>
  </section>
</template>
