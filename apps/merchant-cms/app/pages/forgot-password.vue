<script setup lang="ts">
definePageMeta({
  middleware: "guest",
});

useHead({
  title: "Forgot Password",
});

const auth = useAuthStore();

const form = reactive({
  email: "",
});

const localError = ref("");
const successMessage = ref("");

const submit = async () => {
  localError.value = "";
  successMessage.value = "";

  if (!form.email.trim()) {
    localError.value = "Please enter your email address.";
    return;
  }

  try {
    const response = await auth.forgotPassword({
      email: form.email.trim(),
    });

    successMessage.value = response.message;
  } catch {
    localError.value =
      auth.error || "Unable to request password reset. Please try again.";
  }
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="brand">
        <img class="brand-mark" src="/logo.png" alt="KMRS App" />
        <div>
          <h1 class="brand-title">Reset Password</h1>
          <p class="brand-sub">Send a reset link to your email</p>
        </div>
      </div>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          Email
          <input
            v-model="form.email"
            class="input"
            type="email"
            autocomplete="email"
            required
          />
        </label>
        <div v-if="localError || auth.error" class="error">
          {{ localError || auth.error }}
        </div>
        <div v-if="successMessage" class="success">
          {{ successMessage }}
        </div>
        <button class="button primary" type="submit" :disabled="auth.pending">
          {{ auth.pending ? "Sending..." : "Send reset email" }}
        </button>
      </form>

      <p class="auth-switch">
        Remember your password?
        <NuxtLink class="link" to="/login">Sign in</NuxtLink>
      </p>
    </section>
  </main>
</template>
