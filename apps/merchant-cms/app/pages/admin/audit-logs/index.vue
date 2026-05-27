<script setup lang="ts">
const client = useApiClient()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'permission'],
  permission: 'audit.view'
})

const { data: logs, pending, error, refresh } = await useAsyncData('admin-audit-logs', () =>
  client.getAuditLogs()
)
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Audit Logs</h3>
        <p class="muted">Recent write activity recorded by the backend interceptor.</p>
      </div>
      <button class="btn ghost" type="button" @click="() => refresh()">Refresh</button>
    </div>

    <div v-if="pending" class="state-card">Loading audit logs...</div>
    <div v-else-if="error" class="state-card error">Unable to load audit logs.</div>
    <div v-else-if="!logs?.length" class="state-card">No audit events found.</div>
    <div v-else class="table">
      <div class="table-row header five">
        <span>Action</span>
        <span>Entity</span>
        <span>Status</span>
        <span>Request</span>
        <span>Created</span>
      </div>
      <div v-for="log in logs" :key="log.id" class="table-row five">
        <span>{{ log.action }}</span>
        <span>{{ log.entity || '-' }}</span>
        <span>{{ log.statusCode }}</span>
        <span class="truncate">{{ log.requestId || '-' }}</span>
        <span>{{ new Date(log.createdAt).toLocaleString() }}</span>
      </div>
    </div>
  </section>
</template>
