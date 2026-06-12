// src/site/edit/EditableSection.jsx
// Wraps any section. On hover shows an Edit button.
// When section data updates, triggers a smooth fade out → fade in.
import { useRef, useEffect, useState } from 'react'
import { useSite } from '../SiteContext'
import styles from './EditableSection.module.css'

export default function EditableSection({ sectionId, title, questions, trackKeys, children }) {
  const { openEdit } = useSite()
  const [fading, setFading] = useState(false)
  const prevKeysRef = useRef(null)

  // Watch trackKeys for changes — when they change, trigger the fade
  useEffect(() => {
    const current = JSON.stringify(trackKeys)
    if (prevKeysRef.current !== null && prevKeysRef.current !== current) {
      setFading(true)
      const t = setTimeout(() => setFading(false), 500)
      return () => clearTimeout(t)
    }
    prevKeysRef.current = current
  }, [trackKeys])

  function handleEdit() {
    openEdit({ sectionId, title, questions })
  }

  return (
    <div className={`${styles.wrapper} ${fading ? styles.fading : ''}`}>
      {children}
      <button className={styles.editBtn} onClick={handleEdit} aria-label={`Edit ${title}`}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Edit section
      </button>
    </div>
  )
}
