import { ApiClientError, createApiClient } from '@kmrs-app/api-client'
import type { AuthUserProfile, LoginRequest } from '@kmrs-app/types'

function createClient(baseURL: string, token?: string | null) {
  return createApiClient({
    baseURL,
    getAccessToken: () => token
  })
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const accessToken = useCookie<string | null>('kmrs_access_token', { sameSite: 'lax' })
  const refreshToken = useCookie<string | null>('kmrs_refresh_token', { sameSite: 'lax' })

  const user = ref<AuthUserProfile | null>(null)
  const initialized = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))

  const clearSession = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    errorMessage.value = ''
  }

  const applyAuth = (payload: { accessToken: string, refreshToken: string, user: AuthUserProfile }) => {
    accessToken.value = payload.accessToken
    refreshToken.value = payload.refreshToken
    user.value = payload.user
    errorMessage.value = ''
  }

  const login = async (payload: LoginRequest) => {
    isSubmitting.value = true

    try {
      const client = createClient(config.public.apiBase)
      const response = await client.login(payload)
      applyAuth(response)
      return response
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 429) {
        errorMessage.value = 'Too many login attempts. Wait a minute and try again.'
      } else {
        errorMessage.value = error instanceof ApiClientError ? error.message : 'Unable to sign in'
      }
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const refreshSession = async () => {
    if (!refreshToken.value) {
      clearSession()
      return null
    }

    try {
      const client = createClient(config.public.apiBase)
      const response = await client.refresh({ refreshToken: refreshToken.value })
      applyAuth(response)
      return response
    } catch (error) {
      clearSession()
      throw error
    }
  }

  const fetchMe = async () => {
    if (!accessToken.value) {
      user.value = null
      return null
    }

    const client = createClient(config.public.apiBase, accessToken.value)

    try {
      const profile = await client.getMe()
      user.value = profile
      return profile
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 401) {
        await refreshSession()
        const refreshedClient = createClient(config.public.apiBase, accessToken.value)
        const profile = await refreshedClient.getMe()
        user.value = profile
        return profile
      }

      throw error
    }
  }

  const initializeSession = async () => {
    if (initialized.value) {
      return
    }

    try {
      if (accessToken.value) {
        await fetchMe()
      }
    } catch {
      clearSession()
    } finally {
      initialized.value = true
    }
  }

  const logout = async () => {
    try {
      if (accessToken.value) {
        const client = createClient(config.public.apiBase, accessToken.value)
        await client.logout()
      }
    } catch {
      // Best effort logout.
    } finally {
      clearSession()
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    initialized,
    isSubmitting,
    errorMessage,
    isAuthenticated,
    login,
    fetchMe,
    initializeSession,
    logout,
    refreshSession,
    clearSession
  }
})
