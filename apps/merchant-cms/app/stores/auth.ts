import { ApiClientError, createApiClient } from "@kmrs-app/api-client";
import type {
  AuthResponse,
  AuthUserProfile,
  ForgotPasswordRequest,
  GoogleAuthRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@kmrs-app/types";

const makeClient = (baseURL: string, token?: string | null) =>
  createApiClient({
    baseURL,
    getAccessToken: () => token,
  });

export const useAuthStore = defineStore("auth", () => {
  const config = useRuntimeConfig();
  const accessToken = useCookie<string | null>("kmrs_access_token", {
    sameSite: "lax",
  });
  const refreshToken = useCookie<string | null>("kmrs_refresh_token", {
    sameSite: "lax",
  });

  const user = ref<AuthUserProfile | null>(null);
  const ready = ref(false);
  const pending = ref(false);
  const error = ref("");
  const hasActiveSubscription = ref<boolean | null>(null);
  let refreshInFlight: Promise<AuthResponse | null> | null = null;
  let subscriptionCheckInFlight: Promise<boolean> | null = null;

  const isAuthenticated = computed(() =>
    Boolean(accessToken.value && user.value),
  );
  const needsPlanSelection = computed(
    () =>
      user.value?.role === "MERCHANT_OWNER" &&
      hasActiveSubscription.value === false,
  );

  const clear = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    hasActiveSubscription.value = null;
    error.value = "";
  };

  const apply = (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUserProfile;
  }) => {
    accessToken.value = payload.accessToken;
    refreshToken.value = payload.refreshToken;
    user.value = payload.user;
    hasActiveSubscription.value = null;
    error.value = "";
  };

  const setActiveSubscriptionStatus = (value: boolean | null) => {
    hasActiveSubscription.value = value;
  };

  const login = async (payload: LoginRequest) => {
    pending.value = true;
    error.value = "";
    try {
      const response = await makeClient(config.public.apiBase).login(payload);
      apply(response);
      return response;
    } catch (err) {
      error.value =
        err instanceof ApiClientError ? err.message : "Unable to sign in";
      throw err;
    } finally {
      pending.value = false;
    }
  };

  const register = async (payload: RegisterRequest) => {
    pending.value = true;
    error.value = "";
    try {
      const response = await makeClient(config.public.apiBase).register(
        payload,
      );
      apply(response);
      return response;
    } catch (err) {
      error.value =
        err instanceof ApiClientError
          ? err.message
          : "Unable to create account";
      throw err;
    } finally {
      pending.value = false;
    }
  };

  const googleAuth = async (payload: GoogleAuthRequest) => {
    pending.value = true;
    error.value = "";
    try {
      const response = await makeClient(config.public.apiBase).googleAuth(
        payload,
      );
      apply(response);
      return response;
    } catch (err) {
      error.value =
        err instanceof ApiClientError
          ? err.message
          : "Unable to sign in with Google";
      throw err;
    } finally {
      pending.value = false;
    }
  };

  const forgotPassword = async (payload: ForgotPasswordRequest) => {
    pending.value = true;
    error.value = "";
    try {
      return await makeClient(config.public.apiBase).forgotPassword(payload);
    } catch (err) {
      error.value =
        err instanceof ApiClientError
          ? err.message
          : "Unable to request password reset";
      throw err;
    } finally {
      pending.value = false;
    }
  };

  const resetPassword = async (payload: ResetPasswordRequest) => {
    pending.value = true;
    error.value = "";
    try {
      return await makeClient(config.public.apiBase).resetPassword(payload);
    } catch (err) {
      error.value =
        err instanceof ApiClientError
          ? err.message
          : "Unable to reset password";
      throw err;
    } finally {
      pending.value = false;
    }
  };

  const refresh = async () => {
    if (!refreshToken.value) {
      clear();
      return null;
    }

    refreshInFlight ??= makeClient(config.public.apiBase)
      .refresh({ refreshToken: refreshToken.value })
      .then((response) => {
        apply(response);
        return response;
      })
      .finally(() => {
        refreshInFlight = null;
      });

    return refreshInFlight;
  };

  const refreshSession = async () => {
    try {
      return Boolean(await refresh());
    } catch {
      clear();
      return false;
    }
  };

  const fetchMe = async () => {
    if (!accessToken.value) {
      user.value = null;
      hasActiveSubscription.value = null;
      return null;
    }

    try {
      const profile = await makeClient(
        config.public.apiBase,
        accessToken.value,
      ).getMe();
      user.value = profile;
      return profile;
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        await refresh();
        const profile = await makeClient(
          config.public.apiBase,
          accessToken.value,
        ).getMe();
        user.value = profile;
        return profile;
      }
      throw err;
    }
  };

  const initialize = async () => {
    if (ready.value) {
      return;
    }

    try {
      await fetchMe();
    } catch {
      clear();
    } finally {
      ready.value = true;
    }
  };

  const checkActiveSubscription = async (force = false) => {
    if (!accessToken.value || user.value?.role !== "MERCHANT_OWNER") {
      hasActiveSubscription.value = null;
      return true;
    }

    if (!force && hasActiveSubscription.value !== null) {
      return hasActiveSubscription.value;
    }

    subscriptionCheckInFlight ??= makeClient(
      config.public.apiBase,
      accessToken.value,
    )
      .getCurrentSubscription()
      .then(() => {
        hasActiveSubscription.value = true;
        return true;
      })
      .catch((err) => {
        if (err instanceof ApiClientError && err.statusCode === 404) {
          hasActiveSubscription.value = false;
          return false;
        }

        throw err;
      })
      .finally(() => {
        subscriptionCheckInFlight = null;
      });

    return subscriptionCheckInFlight;
  };

  const logout = async () => {
    try {
      if (accessToken.value) {
        await makeClient(config.public.apiBase, accessToken.value).logout();
      }
    } finally {
      clear();
      clearNuxtData();
    }
  };

  return {
    accessToken,
    refreshToken,
    user,
    ready,
    pending,
    error,
    hasActiveSubscription,
    isAuthenticated,
    needsPlanSelection,
    login,
    register,
    googleAuth,
    forgotPassword,
    resetPassword,
    logout,
    initialize,
    fetchMe,
    checkActiveSubscription,
    setActiveSubscriptionStatus,
    refreshSession,
    clear,
  };
});
