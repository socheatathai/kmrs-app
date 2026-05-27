<script setup lang="ts">
const auth = useAuthStore()
const session = useSessionStore()
const shopStore = useShopStore()

const email = ref('merchant@example.com')
const password = ref('secret123')

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const handleSubmit = async () => {
  try {
    await auth.login({
      email: email.value,
      password: password.value
    })

    shopStore.initializeSelection()
    await navigateTo(session.landingPath)
  } catch {
    // Error state is rendered from the store.
  }
}
</script>

<template>
  <div class="login-shell">
    <div class="login-card">
      <div class="login-header">
        <p class="eyebrow">Merchant CMS</p>
        <h1>Sign in to your workspace</h1>
        <p class="muted">Use seeded credentials from `core-api` to load your real profile and permissions.</p>
      </div>

      <form class="form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" placeholder="merchant@example.com" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" placeholder="secret123" required />
        </label>

        <p v-if="auth.errorMessage" class="form-error">{{ auth.errorMessage }}</p>

        <button class="btn primary" type="submit" :disabled="auth.isSubmitting">
          {{ auth.isSubmitting ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="login-footer">
        <span class="muted">Demo credentials:</span>
        <span class="link">merchant@example.com / secret123</span>
      </div>
    </div>
  </div>
</template>
