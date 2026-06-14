// src/site/SiteContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react'

export const SiteContext = createContext(null)

export function SiteProvider({ initialData, onDataChange, children }) {
  const [data, setData] = useState(initialData)
  const dataRef = useRef(initialData)
  const [editPanel, setEditPanel] = useState(null)

  const updateSection = useCallback(async (patch) => {
    const nextData = { ...dataRef.current, ...patch }
    dataRef.current = nextData
    setData(nextData)
    await onDataChange?.(nextData)
    return nextData
  }, [onDataChange])

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
