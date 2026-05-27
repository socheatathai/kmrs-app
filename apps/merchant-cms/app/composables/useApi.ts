export const useApi = () => {
  const client = useApiClient()

  return {
    client
  }
}
