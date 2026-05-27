import { createApiClient } from '@kmrs-app/api-client'

export const useLegacyApi = () => createApiClient({
  baseURL: useRuntimeConfig().public.apiBase
})
