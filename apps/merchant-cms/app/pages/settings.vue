<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const session = useSessionStore()
await navigateTo(session.mode === 'admin' ? '/admin/settings' : '/merchant/settings')
</script>
