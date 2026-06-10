<script setup lang="ts">
import type { PlanSummary } from '@kmrs-app/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const route = useRoute()
const toast = useToast()
const selectedPlanId = ref('')
const expiredAt = ref('')
const actionError = ref('')
const isSaving = ref(false)
const activeTab = ref<'plans' | 'history'>('plans')
const showPlanChooser = ref(route.query.choosePlan === '1')

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
const onboardingPlans = computed(() => plans.value?.slice(0, 3) ?? [])
const isSelectedCurrentPlan = (plan: PlanSummary) => current.value?.planId === plan.id

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
})
const todayInput = new Date().toISOString().slice(0, 10)
const datePattern = /^\d{4}-\d{2}-\d{2}$/

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'No expiry'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return dateFormatter.format(date)
}

const toApiDate = (value: string) => `${value}T00:00:00.000Z`

const selectPlan = (planId: string) => {
  selectedPlanId.value = planId
  actionError.value = ''
}

const createSubscription = async (planId = selectedPlanId.value) => {
  if (!planId) {
    actionError.value = 'Select a plan first.'
    return
  }

  selectedPlanId.value = planId
  actionError.value = ''

  if (expiredAt.value) {
    if (!datePattern.test(expiredAt.value)) {
      actionError.value = 'Expiry date must use YYYY-MM-DD format.'
      return
    }

    if (expiredAt.value < todayInput) {
      actionError.value = 'Expiry date must be today or later.'
      return
    }
  }

  isSaving.value = true

  try {
    await client.createSubscription({
      planId,
      ...(expiredAt.value ? { expiredAt: toApiDate(expiredAt.value) } : {})
    })
    expiredAt.value = ''
    await Promise.all([refreshCurrent(), refreshSubscriptions()])
    auth.setActiveSubscriptionStatus(true)
    showPlanChooser.value = false
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
    auth.setActiveSubscriptionStatus(false)
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

        <form class="form subscription-form" @submit.prevent="createSubscription()">
          <label class="field">
            Plan
            <select v-model="selectedPlanId" class="select subscription-control" :disabled="plansPending || isSaving">
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ plan.name }} - ${{ plan.price }}
              </option>
            </select>
          </label>
          <label class="field">
            Expiry date
            <input
              v-model.trim="expiredAt"
              class="input subscription-control"
              type="date"
              :min="todayInput"
              :disabled="isSaving"
            >
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

    <Teleport to="body">
      <div v-if="showPlanChooser && !hasCurrentSubscription" class="modal-wrap" role="presentation">
        <div class="modal-backdrop" aria-hidden="true" />
        <section class="plan-dialog" role="dialog" aria-modal="true" aria-labelledby="choose-plan-title">
          <div class="plan-dialog-head">
            <span class="catalog-kicker">One last step</span>
            <h2 id="choose-plan-title">Choose a plan to start</h2>
            <p class="muted">Pick one plan to continue into your merchant workspace. You can manage it later from Subscription.</p>
          </div>

          <div v-if="plansPending" class="empty">Loading plans...</div>
          <div v-else-if="!onboardingPlans.length" class="empty">No plans available right now.</div>
          <div v-else class="plan-choice-list">
            <button
              v-for="plan in onboardingPlans"
              :key="plan.id"
              class="plan-choice"
              type="button"
              :disabled="isSaving"
              @click="createSubscription(plan.id)"
            >
              <span>
                <strong>{{ plan.name }}</strong>
                <span class="muted">{{ plan.maxShops }} shops / {{ plan.maxProducts }} products / {{ plan.maxQrCodes }} QR codes</span>
              </span>
              <span class="plan-choice-price">${{ plan.price }}</span>
            </button>
          </div>

          <div v-if="actionError" class="error">{{ actionError }}</div>
        </section>
      </div>
    </Teleport>
  </div>
</template>
