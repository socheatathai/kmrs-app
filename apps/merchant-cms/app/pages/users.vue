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
    <div v-else class="table">
      <div class="row head five">
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Level</span>
        <span>Status</span>
      </div>
      <div v-for="user in users" :key="user.id" class="row five">
        <strong>{{ user.name }}</strong>
        <span class="truncate">{{ user.email }}</span>
        <span>{{ user.role }}</span>
        <span>L{{ user.level }}</span>
        <span class="pill" :class="user.isActive ? 'ok' : 'warn'">{{ user.isActive ? 'Active' : 'Inactive' }}</span>
      </div>
    </div>
  </section>
</template>
