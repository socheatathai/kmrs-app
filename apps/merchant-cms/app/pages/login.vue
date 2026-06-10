<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const auth = useAuthStore()
const session = useSessionStore()

const form = reactive({
  email: '',
  password: ''
})
const localError = ref('')
const showPassword = ref(false)

const demoCredentials = {
  email: 'nika@example.com',
  password: 'secret123'
}

const fillDemoCredentials = () => {
  form.email = demoCredentials.email
  form.password = demoCredentials.password
}

const submit = async () => {
  localError.value = ''

  if (!form.email.trim()) {
    localError.value = 'Please enter your email address.'
    return
  }

  try {
    await auth.login({
      email: form.email.trim(),
      password: form.password
    })
    return navigateTo(session.landingPath)
  } catch {
    localError.value = auth.error || 'Unable to sign in. Please try again.'
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="brand">
        <div class="brand-mark">K</div>
        <div>
          <h1 class="brand-title">KMRS Merchant CMS</h1>
          <p class="brand-sub">Sign in Account with your credentials</p>
        </div>
      </div>

      <div class="demo-login">
        <div>
          <p class="demo-title">Demo account</p>
          <p class="demo-line">Email: {{ demoCredentials.email }}</p>
          <p class="demo-line">Password: {{ demoCredentials.password }}</p>
        </div>
        <button class="button ghost demo-action" type="button" @click="fillDemoCredentials">
          Use demo
        </button>
      </div>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          Email
          <input v-model="form.email" class="input" type="email" autocomplete="email" required>
        </label>
        <label class="field">
          Password
          <span class="input-wrap">
            <input
              v-model="form.password"
              class="input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            >
            <button class="input-toggle" type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </span>
        </label>
        <div v-if="localError || auth.error" class="error">{{ localError || auth.error }}</div>
        <button class="button primary" type="submit" :disabled="auth.pending">
          {{ auth.pending ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="auth-switch">
        Need a merchant account?
        <NuxtLink class="link" to="/register">Register</NuxtLink>
      </p>
    </section>
  </main>
</template>
