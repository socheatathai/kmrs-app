import { ApiClientError, createApiClient } from '@kmrs-app/api-client'
import type { AuthResponse, AuthUserProfile, LoginRequest, RegisterRequest } from '@kmrs-app/types'

const makeClient = (baseURL: string, token?: string | null) =>
  createApiClient({
    baseURL,
    getAccessToken: () => token
  })

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const accessToken = useCookie<string | null>('kmrs_access_token', { sameSite: 'lax' })
  const refreshToken = useCookie<string | null>('kmrs_refresh_token', { sameSite: 'lax' })

  const user = ref<AuthUserProfile | null>(null)
  const ready = ref(false)
  const pending = ref(false)
  const error = ref('')
  let refreshInFlight: Promise<AuthResponse | null> | null = null

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))

  const clear = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    error.value = ''
  }

  const apply = (payload: { accessToken: string, refreshToken: string, user: AuthUserProfile }) => {
    accessToken.value = payload.accessToken
    refreshToken.value = payload.refreshToken
    user.value = payload.user
    error.value = ''
  }

  const login = async (payload: LoginRequest) => {
    pending.value = true
    try {
      const response = await makeClient(config.public.apiBase).login(payload)
      apply(response)
      return response
    } catch (err) {
      error.value = err instanceof ApiClientError ? err.message : 'Unable to sign in'
      throw err
    } finally {
      pending.value = false
    }
  }

  const register = async (payload: RegisterRequest) => {
    pending.value = true
    try {
      const response = await makeClient(config.public.apiBase).register(payload)
      apply(response)
      return response
    } catch (err) {
      error.value = err instanceof ApiClientError ? err.message : 'Unable to create account'
      throw err
    } finally {
      pending.value = false
    }
  }

  const refresh = async () => {
    if (!refreshToken.value) {
      clear()
      return null
    }

    refreshInFlight ??= makeClient(config.public.apiBase)
      .refresh({ refreshToken: refreshToken.value })
      .then((response) => {
        apply(response)
        return response
      })
      .finally(() => {
        refreshInFlight = null
      })

    return refreshInFlight
  }

  const refreshSession = async () => {
    try {
      return Boolean(await refresh())
    } catch {
      clear()
      return false
    }
  }

  const fetchMe = async () => {
    if (!accessToken.value) {
      user.value = null
      return null
    }

    try {
      const profile = await makeClient(config.public.apiBase, accessToken.value).getMe()
      user.value = profile
      return profile
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        await refresh()
        const profile = await makeClient(config.public.apiBase, accessToken.value).getMe()
        user.value = profile
        return profile
      }
      throw err
    }
  }

  const initialize = async () => {
    if (ready.value) {
      return
    }

    try {
      await fetchMe()
    } catch {
      clear()
    } finally {
      ready.value = true
    }
  }

  const logout = async () => {
    try {
      if (accessToken.value) {
        await makeClient(config.public.apiBase, accessToken.value).logout()
      }
    } finally {
      clear()
      clearNuxtData()
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    ready,
    pending,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    initialize,
    fetchMe,
    refreshSession,
    clear
  }
})
