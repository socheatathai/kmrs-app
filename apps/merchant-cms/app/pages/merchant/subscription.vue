<script setup lang="ts">
const client = useApiClient()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'subscription.view'
})

const [{ data: currentSubscription, pending, error }, { data: plans }] = await Promise.all([
  useAsyncData('current-subscription', () => client.getCurrentSubscription()),
  useAsyncData('subscription-plans', () => client.getPlans())
])
</script>

<template>
  <div class="page-stack">
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Current Subscription</h3>
          <p class="muted">Current plan information from the core API.</p>
        </div>
      </div>

      <div v-if="pending" class="state-card">Loading subscription...</div>
      <div v-else-if="error" class="state-card error">No active subscription found for this session.</div>
      <div v-else-if="currentSubscription" class="info-list">
        <div class="info-item"><span class="eyebrow">Plan</span><strong>{{ currentSubscription.plan?.name }}</strong></div>
        <div class="info-item"><span class="eyebrow">Status</span><strong>{{ currentSubscription.status }}</strong></div>
        <div class="info-item"><span class="eyebrow">Expires</span><strong>{{ currentSubscription.expiredAt ? new Date(currentSubscription.expiredAt).toLocaleDateString() : 'No expiry' }}</strong></div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Available Plans</h3>
          <p class="muted">Pulled from the public plans API.</p>
        </div>
      </div>
      <div v-if="!plans?.length" class="state-card">No plans are available.</div>
      <div v-else class="table">
        <div class="table-row header four">
          <span>Plan</span>
          <span>Price</span>
          <span>Shop Limit</span>
          <span>Product Limit</span>
        </div>
        <div v-for="plan in plans" :key="plan.id" class="table-row four">
          <span>{{ plan.name }}</span>
          <span>${{ plan.price }}</span>
          <span>{{ plan.maxShops }}</span>
          <span>{{ plan.maxProducts }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
