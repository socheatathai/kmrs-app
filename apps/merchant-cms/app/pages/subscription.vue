<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const { data: current, pending: currentPending, error: currentError } = await useAsyncData(
  () => `current-subscription-${auth.user?.id ?? 'anonymous'}`,
  () => client.getCurrentSubscription()
)
const { data: plans, pending: plansPending } = await useAsyncData('plans', () => client.getPlans())
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Subscription</h2>
          <p class="muted">Current subscription and available API plans.</p>
        </div>
      </div>

      <div v-if="currentPending" class="empty">Loading subscription...</div>
      <div v-else-if="currentError" class="error">Unable to load current subscription.</div>
      <div v-else-if="current" class="grid">
        <div class="card"><span class="muted">Plan</span><strong>{{ current.plan?.name || current.planId }}</strong></div>
        <div class="card"><span class="muted">Status</span><strong>{{ current.status }}</strong></div>
        <div class="card"><span class="muted">Expires</span><strong>{{ current.expiredAt ? new Date(current.expiredAt).toLocaleDateString() : 'No expiry' }}</strong></div>
      </div>
    </section>

    <section class="panel">
      <h2>Plans</h2>
      <div v-if="plansPending" class="empty">Loading plans...</div>
      <div v-else-if="!plans?.length" class="empty">No plans available.</div>
      <div v-else class="grid">
        <div v-for="plan in plans" :key="plan.id" class="card metric">
          <span class="muted">{{ plan.name }}</span>
          <strong class="metric-value">${{ plan.price }}</strong>
          <span class="muted">{{ plan.maxShops }} shops - {{ plan.maxProducts }} products - {{ plan.maxQrCodes }} QR codes</span>
        </div>
      </div>
    </section>
  </div>
</template>
