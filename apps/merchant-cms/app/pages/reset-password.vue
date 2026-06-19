<script setup lang="ts">
definePageMeta({
  middleware: "guest",
});

useHead({
  title: "Reset Password",
});

const route = useRoute();
const auth = useAuthStore();

const form = reactive({
  token: typeof route.query.token === "string" ? route.query.token : "",
  password: "",
  confirmPassword: "",
});

const localError = ref("");
const successMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const submit = async () => {
  localError.value = "";
  successMessage.value = "";

  if (!form.token.trim()) {
    localError.value = "Please enter your reset token.";
    return;
  }

  if (form.password !== form.confirmPassword) {
    localError.value = "Passwords do not match.";
    return;
  }

  try {
    const response = await auth.resetPassword({
      token: form.token.trim(),
      password: form.password,
    });

    successMessage.value = response.message;
    form.password = "";
    form.confirmPassword = "";
  } catch {
    localError.value =
      auth.error || "Unable to reset password. Please try again.";
  }
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="brand">
        <img class="brand-mark" src="/logo.png" alt="KMRS App" />
        <div>
          <h1 class="brand-title">New Password</h1>
          <p class="brand-sub">Set a new password for your account</p>
        </div>
      </div>

      <form class="form" @submit.prevent="submit">
        <!-- <label class="field">
          Reset token
          <textarea v-model="form.token" class="input token-box" required />
        </label> -->
        <label class="field">
          New password
          <span class="input-wrap">
            <input
              v-model="form.password"
              class="input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              minlength="6"
              required
            />
            <button
              class="input-toggle"
              type="button"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Hide" : "Show" }}
            </button>
          </span>
        </label>
        <label class="field">
          Confirm password
          <span class="input-wrap">
            <input
              v-model="form.confirmPassword"
              class="input"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              minlength="6"
              required
            />
            <button
              class="input-toggle"
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? "Hide" : "Show" }}
            </button>
          </span>
        </label>
        <div v-if="localError || auth.error" class="error">
          {{ localError || auth.error }}
        </div>
        <div v-if="successMessage" class="success">
          {{ successMessage }}
        </div>
        <button class="button primary" type="submit" :disabled="auth.pending">
          {{ auth.pending ? "Saving..." : "Save new password" }}
        </button>
      </form>

      <p class="auth-switch">
        Ready to sign in?
        <NuxtLink class="link" to="/login">Sign in</NuxtLink>
      </p>
    </section>
  </main>
</template>
