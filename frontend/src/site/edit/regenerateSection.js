import { apiRequest, readApiError } from '../../services/apiClient'

export async function regenerateSection(sectionId, answers, siteData, access = {}) {
  const { claimToken: _claimToken, owned: _owned, ...safeSiteData } = siteData
  const response = await apiRequest('/api/regenerate-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId: siteData.siteId, sectionId, answers, siteData: safeSiteData }),
  }, access)

  if (!response.ok) {
    throw await readApiError(response, 'Section regeneration failed')
  }

  const result = await response.json()
  return result.patch
}
