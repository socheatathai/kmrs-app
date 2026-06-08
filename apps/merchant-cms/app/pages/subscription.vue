<script setup lang="ts">
import type { PlanSummary } from '@kmrs-app/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const toast = useToast()
const selectedPlanId = ref('')
const expiredAt = ref('')
const actionError = ref('')
const isSaving = ref(false)
const activeTab = ref<'plans' | 'history'>('plans')

const planColumns = [
  { key: 'name', label: 'Plan' },
  { key: 'price', label: 'Price' },
  { key: 'limits', label: 'Limits' },
  { key: 'action', label: 'Action' }
]

const historyColumns = [
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'startedAt', label: 'Started' },
  { key: 'expiredAt', label: 'Expires' }
]

const { data: current, pending: currentPending, error: currentError, refresh: refreshCurrent } = await useAsyncData(
  () => `current-subscription-${auth.user?.id ?? 'anonymous'}`,
  () => client.getCurrentSubscription()
)
const { data: plans, pending: plansPending } = await useAsyncData('plans', () => client.getPlans())
const { data: subscriptions, pending: subscriptionsPending, refresh: refreshSubscriptions } = await useAsyncData(
  () => `subscriptions-${auth.user?.id ?? 'anonymous'}`,
  () => client.getMySubscriptions()
)

watch(plans, (items) => {
  if (!selectedPlanId.value && items?.length) {
    selectedPlanId.value = items[0]?.id ?? ''
  }
}, { immediate: true })

const hasCurrentSubscription = computed(() => Boolean(current.value && !currentError.value))
const isSelectedCurrentPlan = (plan: PlanSummary) => current.value?.planId === plan.id

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'No expiry'

const selectPlan = (planId: string) => {
  selectedPlanId.value = planId
  actionError.value = ''
}

const createSubscription = async () => {
  if (!selectedPlanId.value) {
    actionError.value = 'Select a plan first.'
    return
  }

  actionError.value = ''
  isSaving.value = true

  try {
    await client.createSubscription({
      planId: selectedPlanId.value,
      ...(expiredAt.value ? { expiredAt: new Date(expiredAt.value).toISOString() } : {})
    })
    expiredAt.value = ''
    await Promise.all([refreshCurrent(), refreshSubscriptions()])
    toast.add({
      title: 'Subscription created',
      description: 'The selected plan is now active.'
    })
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Unable to create subscription.'
  } finally {
    isSaving.value = false
  }
}

const cancelCurrent = async () => {
  if (!current.value?.id) {
    return
  }

  actionError.value = ''
  isSaving.value = true

  try {
    await client.cancelSubscription(current.value.id, {})
    await Promise.all([refreshCurrent(), refreshSubscriptions()])
    toast.add({
      title: 'Subscription cancelled',
      description: 'The current subscription was cancelled.'
    })
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Unable to cancel subscription.'
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
          <h2>Subscription</h2>
          <p class="muted">Current plan, usage limits, and billing history.</p>
        </div>
        <button v-if="hasCurrentSubscription" class="button ghost" type="button" :disabled="isSaving" @click="cancelCurrent">
          Cancel current
        </button>
      </div>

      <div v-if="currentPending" class="empty">Loading subscription...</div>
      <div v-else-if="currentError" class="empty">No active subscription.</div>
      <div v-else-if="current" class="grid">
        <div class="card"><span class="muted">Plan</span><strong>{{ current.plan?.name || current.planId }}</strong></div>
        <div class="card"><span class="muted">Status</span><span class="pill" :class="current.status === 'ACTIVE' ? 'ok' : 'warn'">{{ current.status }}</span></div>
        <div class="card"><span class="muted">Expires</span><strong>{{ formatDate(current.expiredAt) }}</strong></div>
      </div>
    </section>

    <section class="panel">
      <div class="tabs" role="tablist" aria-label="Subscription sections">
        <button class="tab" :class="{ active: activeTab === 'plans' }" type="button" @click="activeTab = 'plans'">
          Plans
        </button>
        <button class="tab" :class="{ active: activeTab === 'history' }" type="button" @click="activeTab = 'history'">
          History
        </button>
      </div>

      <div v-if="activeTab === 'plans'" class="tab-panel">
        <div class="panel-head">
          <div>
            <h2>Plans</h2>
            <p class="muted">Select a plan and create a subscription.</p>
          </div>
        </div>

        <form class="form form-grid" @submit.prevent="createSubscription">
          <label class="field">
            Plan
            <select v-model="selectedPlanId" class="select" :disabled="plansPending || isSaving">
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ plan.name }} - ${{ plan.price }}
              </option>
            </select>
          </label>
          <label class="field">
            Expiry date
            <input v-model="expiredAt" class="input" type="date">
          </label>
          <div class="form-actions">
            <button class="button primary" type="submit" :disabled="isSaving || !selectedPlanId">
              {{ isSaving ? 'Saving...' : 'Create subscription' }}
            </button>
          </div>
        </form>

        <div v-if="actionError" class="error">{{ actionError }}</div>

        <div v-if="plansPending" class="empty">Loading plans...</div>
        <div v-else-if="!plans?.length" class="empty">No plans available.</div>
        <DataTable v-else row-class="four" :columns="planColumns" :rows="plans" :show-toolbar="false" :show-footer="false">
          <template #cell-price="{ row }">
            <strong>${{ row.price }}</strong>
          </template>
          <template #cell-limits="{ row }">
            {{ row.maxShops }} shops / {{ row.maxProducts }} products / {{ row.maxQrCodes }} QR codes
          </template>
          <template #cell-action="{ row }">
            <button
              class="button ghost"
              type="button"
              :disabled="isSelectedCurrentPlan(row as PlanSummary)"
              @click="selectPlan(String(row.id))"
            >
              {{ isSelectedCurrentPlan(row as PlanSummary) ? 'Current' : selectedPlanId === row.id ? 'Selected' : 'Select' }}
            </button>
          </template>
        </DataTable>
      </div>

      <div v-else class="tab-panel">
        <h2>History</h2>
        <div v-if="subscriptionsPending" class="empty">Loading subscriptions...</div>
        <div v-else-if="!subscriptions?.length" class="empty">No subscription history.</div>
        <DataTable v-else row-class="four" :columns="historyColumns" :rows="subscriptions" search-placeholder="Search subscriptions">
          <template #cell-plan="{ row }">
            <strong>{{ row.plan?.name || row.planId }}</strong>
          </template>
          <template #cell-status="{ value }">
            <span class="pill" :class="value === 'ACTIVE' ? 'ok' : 'warn'">{{ value }}</span>
          </template>
          <template #cell-startedAt="{ value }">
            {{ formatDate(String(value)) }}
          </template>
          <template #cell-expiredAt="{ value }">
            {{ formatDate(value ? String(value) : null) }}
          </template>
        </DataTable>
      </div>
    </section>
  </div>
</template>
