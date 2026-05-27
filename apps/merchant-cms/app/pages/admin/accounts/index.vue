<script setup lang="ts">
const client = useApiClient()
const { can } = usePermissions()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'permission'],
  permission: 'account.view'
})

const { data: users, pending, error, refresh } = await useAsyncData('admin-users', () =>
  client.getUsers()
)

const isDeleting = ref<string | null>(null)
const actionError = ref('')

const removeUser = async (userId: string) => {
  if (!window.confirm('Delete this account? This action cannot be undone.')) {
    return
  }

  actionError.value = ''
  isDeleting.value = userId

  try {
    await client.deleteUser(userId)
    await refresh()
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Unable to delete account.'
  } finally {
    isDeleting.value = null
  }
}
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Account Management</h3>
        <p class="muted">Manage users visible to the current actor under level hierarchy rules.</p>
      </div>
      <div class="inline-actions">
        <NuxtLink v-if="can('account.create')" class="btn primary" to="/admin/accounts/create">
          New account
        </NuxtLink>
        <button class="btn ghost" type="button" @click="() => refresh()">Refresh</button>
      </div>
    </div>

    <div v-if="pending" class="state-card">
      Loading manageable users...
    </div>
    <div v-else-if="error" class="state-card error">
      Unable to load users.
    </div>
    <div v-else-if="!users?.length" class="state-card">
      No manageable users found for this account.
    </div>
    <div v-else class="table">
      <p v-if="actionError" class="form-error">{{ actionError }}</p>

      <div class="table-row header seven">
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Level</span>
        <span>Status</span>
        <span>Permissions</span>
        <span>Actions</span>
      </div>
      <div v-for="user in users" :key="user.id" class="table-row seven">
        <span>{{ user.name }}</span>
        <span>{{ user.email }}</span>
        <span>{{ user.role }}</span>
        <span>L{{ user.level }}</span>
        <span class="pill" :class="user.isActive ? 'ok' : 'warn'">{{ user.isActive ? 'Active' : 'Inactive' }}</span>
        <span>{{ user.permissions.length }}</span>
        <div class="inline-actions">
          <NuxtLink v-if="can('account.update')" class="link-inline" :to="`/admin/accounts/${user.id}`">
            Edit
          </NuxtLink>
          <button
            v-if="can('account.delete')"
            class="btn ghost small"
            type="button"
            :disabled="isDeleting === user.id"
            @click="removeUser(user.id)"
          >
            {{ isDeleting === user.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
