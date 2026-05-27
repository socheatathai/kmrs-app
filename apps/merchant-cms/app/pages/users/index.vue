<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

await navigateTo('/admin/accounts')
</script>
