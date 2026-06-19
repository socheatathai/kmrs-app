<script setup lang="ts">
definePageMeta({
  middleware: "guest",
});

useHead({
  title: "Create Merchant Account",
});

const auth = useAuthStore();
const session = useSessionStore();
const googleIdentity = useGoogleIdentity();
const { isConfigured: isGoogleConfigured, requestAccessToken } = googleIdentity;

const form = reactive({
  name: "",
  shopName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const localError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const submit = async () => {
  localError.value = "";

  if (!form.email.trim()) {
    localError.value = "Please enter your email address.";
    return;
  }

  if (!form.shopName.trim()) {
    localError.value = "Please enter your store name.";
    return;
  }

  if (form.password !== form.confirmPassword) {
    localError.value = "Passwords do not match";
    return;
  }

  try {
    await auth.register({
      name: form.name.trim(),
      shopName: form.shopName.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    return navigateTo("/subscription?choosePlan=1");
  } catch {
    localError.value =
      auth.error || "Unable to create account. Please try again.";
  }
};

const navigateAfterAuth = async () => {
  const hasSubscription = await auth.checkActiveSubscription(true);

  return navigateTo(
    hasSubscription ? session.landingPath : "/subscription?choosePlan=1",
  );
};

const submitGoogle = async () => {
  localError.value = "";

  try {
    const accessToken = await requestAccessToken();
    await auth.googleAuth({ accessToken });

    return navigateAfterAuth();
  } catch (error) {
    localError.value =
      auth.error ||
      (error instanceof Error ? error.message : "") ||
      "Unable to create account with Google. Please try again.";
  }
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="brand">
        <img class="brand-mark" src="/logo.png" alt="KMRS App" />
        <div>
          <h1 class="brand-title">KMRS App</h1>
          <p class="brand-sub">Create your merchant account</p>
        </div>
      </div>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          Full name
          <input
            v-model="form.name"
            class="input"
            type="text"
            autocomplete="name"
            required
          />
        </label>
        <label class="field">
          Store name
          <input
            v-model="form.shopName"
            class="input"
            type="text"
            autocomplete="organization"
            required
          />
        </label>
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
        <label class="field">
          Password
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
        <button class="button primary" type="submit" :disabled="auth.pending">
          {{ auth.pending ? "Creating account..." : "Create account" }}
        </button>
      </form>

      <div v-if="isGoogleConfigured" class="oauth-block">
        <div class="oauth-divider"><span>or</span></div>
        <button
          class="button ghost google-auth-button"
          type="button"
          :disabled="auth.pending"
          @click="submitGoogle"
        >
          <span class="google-auth-logo" aria-hidden="true">
            <span>G</span>
          </span>
          <span>Sign up with Google</span>
        </button>
      </div>

      <p class="auth-switch">
        Already have an account?
        <NuxtLink class="link" to="/login">Sign in</NuxtLink>
      </p>
    </section>
  </main>
</template>
