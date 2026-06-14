export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function apiRequest(path, options = {}, access = {}) {
  const headers = new Headers(options.headers || {})
  const bearerToken = access.getToken ? await access.getToken().catch(() => null) : null

  if (bearerToken) headers.set('Authorization', `Bearer ${bearerToken}`)
  if (access.claimToken) headers.set('X-Wouessi-Claim-Token', access.claimToken)

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
}

export async function readApiError(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))
  return new Error(body.message || fallbackMessage)
}
