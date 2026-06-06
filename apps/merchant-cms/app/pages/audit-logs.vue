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
    <div v-else class="table">
      <div class="row head five">
        <span>Action</span>
        <span>Entity</span>
        <span>Method</span>
        <span>Status</span>
        <span>Created</span>
      </div>
      <div v-for="log in logs" :key="log.id" class="row five">
        <strong>{{ log.action }}</strong>
        <span>{{ log.entity || 'System' }}</span>
        <span>{{ log.method }}</span>
        <span>{{ log.statusCode }}</span>
        <span>{{ new Date(log.createdAt).toLocaleString() }}</span>
      </div>
    </div>
  </section>
</template>
