<script setup lang="ts">
definePageMeta({
  middleware: "guest",
});

useHead({
  title: "Forgot Password",
});

</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="brand">
        <img class="brand-mark" src="/logo.png" alt="KMRS App" />
        <div>
          <h1 class="brand-title">Reset Password</h1>
          <p class="brand-sub">Password recovery</p>
        </div>
      </div>

      <div class="service-notice" role="status">
        <strong>Password reset is not available yet.</strong>
        <p>
          This service is currently under development. Please contact support
          or try again later.
        </p>
      </div>

      <p class="auth-switch">
        Remember your password?
        <NuxtLink class="link" to="/login">Sign in</NuxtLink>
      </p>
    </section>
  </main>
</template>
