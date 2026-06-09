<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useApiClient()
const auth = useAuthStore()
const { data: users, pending, error } = await useAsyncData(
  () => `users-${auth.user?.id ?? 'anonymous'}`,
  () => client.getUsers()
)
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'level', label: 'Level' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Users</h2>
        <p class="muted">Managed users from `/users`.</p>
      </div>
    </div>

    <div v-if="pending" class="empty">Loading users...</div>
    <div v-else-if="error" class="error">Unable to load users.</div>
    <div v-else-if="!users?.length" class="empty">No users found.</div>
    <DataTable v-else row-class="five" :columns="columns" :rows="users">
      <template #cell-name="{ row }">
        <strong>{{ row.name }}</strong>
      </template>
      <template #cell-email="{ value }">
        <span class="truncate">{{ value }}</span>
      </template>
      <template #cell-level="{ value }">
        L{{ value }}
      </template>
      <template #cell-status="{ row }">
        <span class="pill" :class="row.isActive ? 'ok' : 'warn'">{{ row.isActive ? 'Active' : 'Inactive' }}</span>
      </template>
    </DataTable>
  </section>
</template>
