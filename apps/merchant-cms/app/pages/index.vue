<script setup lang="ts">
const auth = useAuthStore()
const session = useSessionStore()

await auth.initializeSession()
await navigateTo(auth.isAuthenticated ? session.landingPath : '/login')
</script>
