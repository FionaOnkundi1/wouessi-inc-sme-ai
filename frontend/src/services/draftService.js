import { apiRequest, readApiError } from './apiClient'

export async function claimDraft(siteId, claimToken, getToken) {
  const response = await apiRequest(
    `/api/sites/${siteId}/claim`,
    { method: 'POST' },
    { claimToken, getToken },
  )

  if (!response.ok) {
    throw await readApiError(response, 'Could not save this draft to your account.')
  }

  return response.json()
}
