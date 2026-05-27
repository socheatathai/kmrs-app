<script setup lang="ts">
const auth = useAuthStore()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'permission'],
  permission: 'settings.view'
})
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>Platform Settings</h3>
        <p class="muted">MVP read-only overview for the current admin session.</p>
      </div>
    </div>

    <div class="info-list">
      <div class="info-item">
        <span class="eyebrow">Signed in as</span>
        <strong>{{ auth.user?.email }}</strong>
      </div>
      <div class="info-item">
        <span class="eyebrow">Role</span>
        <strong>{{ auth.user?.role }}</strong>
      </div>
      <div class="info-item">
        <span class="eyebrow">Level</span>
        <strong>{{ auth.user?.level }}</strong>
      </div>
    </div>
  </section>
</template>
