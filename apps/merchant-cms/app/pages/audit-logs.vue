<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const { data: logs, pending, error } = await useAsyncData(
  () => `audit-logs-${auth.user?.id ?? 'anonymous'}`,
  () => client.getAuditLogs()
)
const columns = [
  { key: 'action', label: 'Action' },
  { key: 'entity', label: 'Entity' },
  { key: 'method', label: 'Method' },
  { key: 'statusCode', label: 'Status' },
  { key: 'createdAt', label: 'Created' }
]
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Audit Logs</h2>
        <p class="muted">Recent activity from `/audit-logs`.</p>
      </div>
    </div>

    <div v-if="pending" class="empty">Loading logs...</div>
    <div v-else-if="error" class="error">Unable to load audit logs.</div>
    <div v-else-if="!logs?.length" class="empty">No audit logs found.</div>
    <DataTable v-else row-class="five" :columns="columns" :rows="logs">
      <template #cell-action="{ value }">
        <strong>{{ value }}</strong>
      </template>
      <template #cell-entity="{ value }">
        {{ value || 'System' }}
      </template>
      <template #cell-createdAt="{ value }">
        {{ new Date(String(value)).toLocaleString() }}
      </template>
    </DataTable>
  </section>
</template>
