import { ApiClientError, createApiClient } from '@kmrs-app/api-client'
import type { LoginRequest } from '@kmrs-app/types'

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

  const initialized = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    errorMessage.value = ''
  }

  const applyTokens = (payload: { accessToken: string, refreshToken: string }) => {
    accessToken.value = payload.accessToken
    refreshToken.value = payload.refreshToken
    errorMessage.value = ''
  }

  const login = async (payload: LoginRequest) => {
    isSubmitting.value = true

    try {
      const client = createClient(config.public.apiBase)
      const tokens = await client.login(payload)
      applyTokens(tokens)

      // Load the latest session state immediately after authenticating.
      const session = useSessionStore()
      await session.fetchSession()

      return tokens
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
      clearTokens()
      return null
    }

    try {
      const client = createClient(config.public.apiBase)
      const tokens = await client.refresh({ refreshToken: refreshToken.value })
      applyTokens(tokens)
      return tokens
    } catch (error) {
      clearTokens()
      throw error
    }
  }

  // Best-effort refresh that never throws; returns true when a new access
  // token was obtained. Used by the session store on a 401.
  const tryRefresh = async () => {
    try {
      const tokens = await refreshSession()
      return Boolean(tokens)
    } catch {
      return false
    }
  }

  const initializeSession = async () => {
    if (initialized.value) {
      return
    }

    const session = useSessionStore()

    try {
      if (accessToken.value) {
        await session.fetchSession()
      }
    } catch {
      clearTokens()
      session.clear()
    } finally {
      initialized.value = true
    }
  }

  const logout = async () => {
    const session = useSessionStore()

    try {
      if (accessToken.value) {
        const client = createClient(config.public.apiBase, accessToken.value)
        await client.logout()
      }
    } catch {
      // Best effort logout.
    } finally {
      clearTokens()
      session.clear()
      initialized.value = false
    }
  }

  return {
    accessToken,
    refreshToken,
    initialized,
    isSubmitting,
    errorMessage,
    isAuthenticated,
    login,
    initializeSession,
    refreshSession,
    tryRefresh,
    logout,
    clearTokens
  }
})
