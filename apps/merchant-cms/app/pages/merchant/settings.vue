<script setup lang="ts">
const session = useSessionStore()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'merchant', 'permission'],
  permission: 'settings.view'
})
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Workspace Settings</h3>
        <p class="muted">Session and profile data loaded from the authenticated user response.</p>
      </div>
    </div>

    <div class="info-list">
      <div class="info-item"><span class="eyebrow">Name</span><strong>{{ session.user?.name }}</strong></div>
      <div class="info-item"><span class="eyebrow">Email</span><strong>{{ session.user?.email }}</strong></div>
      <div class="info-item"><span class="eyebrow">Role</span><strong>{{ session.user?.role }}</strong></div>
      <div class="info-item"><span class="eyebrow">Level</span><strong>{{ session.user?.level }}</strong></div>
      <div class="info-item"><span class="eyebrow">Permissions</span><strong>{{ session.permissions.length }}</strong></div>
    </div>
  </section>
</template>
