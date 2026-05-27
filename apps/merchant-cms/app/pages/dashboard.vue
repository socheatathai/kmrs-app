<script setup lang="ts">
const session = useSessionStore()

definePageMeta({
  middleware: 'auth'
})

await navigateTo(session.landingPath)
</script>
