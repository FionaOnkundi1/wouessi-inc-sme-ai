import { apiRequest, readApiError } from './apiClient'

export async function listOwnedSites(getToken) {
  const response = await apiRequest('/api/sites', {}, { getToken })

  if (!response.ok) {
    throw await readApiError(response, 'Could not load your saved websites.')
  }

  const result = await response.json()
  return result.sites
}

export async function deleteOwnedSite(siteId, getToken) {
  const response = await apiRequest(
    `/api/sites/${siteId}`,
    { method: 'DELETE' },
    { getToken },
  )

  if (!response.ok) {
    throw await readApiError(response, 'Could not delete this website.')
  }
}

export async function publishOwnedSite(siteId, getToken) {
  return updatePublishingStatus(siteId, 'publish', getToken, 'Could not publish this website.')
}

export async function unpublishOwnedSite(siteId, getToken) {
  return updatePublishingStatus(siteId, 'unpublish', getToken, 'Could not unpublish this website.')
}

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

export async function saveDraftContent(siteId, siteContent, access = {}) {
  const response = await apiRequest(
    `/api/sites/${siteId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteContent: removeClientOnlyFields(siteContent) }),
    },
    access,
  )

  if (!response.ok) {
    throw await readApiError(response, 'Could not save website changes.')
  }

  return response.json()
}

export async function loadDraft(siteId, access = {}) {
  const response = await apiRequest(`/api/sites/${siteId}`, {}, access)

  if (!response.ok) {
    throw await readApiError(response, 'Could not load this saved website.')
  }

  const result = await response.json()
  return {
    ...result.siteContent,
    siteId: result.siteId,
    templateId: result.templateId,
    styleTokens: result.styleTokens,
    seo: result.seo,
    slug: result.slug || result.siteContent.slug,
    status: result.status,
    publishUrl: result.publishUrl,
    publishedAt: result.publishedAt,
  }
}

async function updatePublishingStatus(siteId, action, getToken, fallbackMessage) {
  const response = await apiRequest(
    `/api/sites/${siteId}/${action}`,
    { method: 'POST' },
    { getToken },
  )

  if (!response.ok) {
    throw await readApiError(response, fallbackMessage)
  }

  return response.json()
}

function removeClientOnlyFields(siteContent) {
  const {
    claimToken: _claimToken,
    owned: _owned,
    siteId: _siteId,
    sessionId: _sessionId,
    status: _status,
    previewUrl: _previewUrl,
    publishUrl: _publishUrl,
    publishedAt: _publishedAt,
    ...persistedContent
  } = siteContent

  return persistedContent
}
