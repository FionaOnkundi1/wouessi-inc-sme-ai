// src/site/SiteContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'

export const SiteContext = createContext(null)

export function SiteProvider({ initialData, children }) {
  const [data, setData] = useState(initialData)
  const [editPanel, setEditPanel] = useState(null)

  const updateSection = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...patch }))
  }, [])

  const openEdit = useCallback((config) => {
    setEditPanel(config)
  }, [])

  const closeEdit = useCallback(() => {
    setEditPanel(null)
  }, [])

  return (
    <SiteContext.Provider value={{ data, updateSection, editPanel, openEdit, closeEdit }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used inside a SiteProvider')
  return ctx
}
