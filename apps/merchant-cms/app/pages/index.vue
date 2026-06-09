<script setup lang="ts">
const auth = useAuthStore()
const session = useSessionStore()

await auth.initialize()
await navigateTo(auth.isAuthenticated ? session.landingPath : '/login')
</script>

<template>
  <div class="empty">Opening workspace...</div>
</template>
