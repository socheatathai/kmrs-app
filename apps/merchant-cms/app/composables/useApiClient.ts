import { createApiClient } from '@kmrs-app/api-client'

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  return createApiClient({
    baseURL: config.public.apiBase,
    getAccessToken: () => auth.accessToken,
    onUnauthorized: () => auth.refreshSession()
  })
}
