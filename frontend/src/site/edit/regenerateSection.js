const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function regenerateSection(sectionId, answers, siteData) {
  const response = await fetch(`${API_URL}/api/regenerate-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, answers, siteData }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Section regeneration failed')
  }

  const result = await response.json()
  return result.patch
}
