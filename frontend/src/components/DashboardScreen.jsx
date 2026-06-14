import { useCallback, useEffect, useState } from 'react'
import { AuthControls, useWouessiAuth } from '../auth/AuthContext'
import { deleteOwnedSite, listOwnedSites } from '../services/draftService'
import styles from './DashboardScreen.module.css'

export default function DashboardScreen({ onOpenSite, onStartNew }) {
  const auth = useWouessiAuth()
  const [sites, setSites] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [siteToDelete, setSiteToDelete] = useState(null)
  const [deleteStatus, setDeleteStatus] = useState('idle')

  const loadSites = useCallback(async () => {
    if (!auth.isLoaded) return
    if (!auth.configured || !auth.isSignedIn) {
      setStatus('signed-out')
      return
    }

    setStatus('loading')
    setMessage('')
    try {
      setSites(await listOwnedSites(auth.getToken))
      setStatus('ready')
    } catch (error) {
      setMessage(error.message)
      setStatus('error')
    }
  }, [auth.configured, auth.getToken, auth.isLoaded, auth.isSignedIn])

  useEffect(() => {
    loadSites()
  }, [loadSites])

  async function confirmDelete() {
    if (!siteToDelete) return

    setDeleteStatus('deleting')
    setMessage('')
    try {
      await deleteOwnedSite(siteToDelete.siteId, auth.getToken)
      setSites((current) => current.filter((site) => site.siteId !== siteToDelete.siteId))
      setSiteToDelete(null)
      setDeleteStatus('idle')
    } catch (error) {
      setMessage(error.message)
      setDeleteStatus('error')
    }
  }

  function closeDeleteDialog() {
    if (deleteStatus === 'deleting') return
    setSiteToDelete(null)
    setDeleteStatus('idle')
    setMessage('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={onStartNew} aria-label="Wouessi home">
          <img src="/logo.png" alt="" />
        </button>
        <div className={styles.headerActions}>
          <button className={styles.newButton} type="button" onClick={onStartNew}>New website</button>
          <AuthControls className={styles.accountControls} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>Workspace</p>
            <h1>My websites</h1>
            <p className={styles.subtitle}>Open and continue editing websites saved to your account.</p>
          </div>
          <button className={styles.primaryButton} type="button" onClick={onStartNew}>Create website</button>
        </div>

        {status === 'loading' && <DashboardMessage>Loading saved websites…</DashboardMessage>}

        {status === 'signed-out' && (
          <DashboardMessage>
            <strong>Sign in to view your websites.</strong>
            <button className={styles.primaryButton} type="button" onClick={auth.openSignIn}>Sign in</button>
          </DashboardMessage>
        )}

        {status === 'error' && (
          <DashboardMessage>
            <strong>Saved websites could not be loaded.</strong>
            <span>{message}</span>
            <button className={styles.secondaryButton} type="button" onClick={loadSites}>Try again</button>
          </DashboardMessage>
        )}

        {status === 'ready' && sites.length === 0 && (
          <DashboardMessage>
            <strong>No saved websites yet.</strong>
            <span>Create a website, then save it to your account to see it here.</span>
            <button className={styles.primaryButton} type="button" onClick={onStartNew}>Create your first website</button>
          </DashboardMessage>
        )}

        {status === 'ready' && sites.length > 0 && (
          <section className={styles.siteList} aria-label="Saved websites">
            {sites.map((site) => (
              <article className={styles.siteRow} key={site.siteId}>
                <div className={styles.siteSummary}>
                  <div className={styles.siteIcon} aria-hidden="true">{site.name.slice(0, 1).toUpperCase()}</div>
                  <div className={styles.siteText}>
                    <h2>{site.name}</h2>
                    <p>{site.tagline || 'Saved website draft'}</p>
                    <span>wouessi.site/{site.slug}</span>
                  </div>
                </div>
                <div className={styles.siteMeta}>
                  <Status status={site.status} />
                  <span>{formatTemplate(site.templateId)}</span>
                  <span>Updated {formatDate(site.updatedAt)}</span>
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.openButton} type="button" onClick={() => onOpenSite(site.siteId)}>
                    Open editor
                  </button>
                  <button className={styles.deleteButton} type="button" onClick={() => setSiteToDelete(site)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {siteToDelete && (
        <div className={styles.dialogBackdrop} role="presentation" onMouseDown={closeDeleteDialog}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className={styles.dialogEyebrow}>Delete website</p>
            <h2 id="delete-dialog-title">Delete {siteToDelete.name}?</h2>
            <p>This permanently removes the saved website from your account. This action cannot be undone.</p>
            {deleteStatus === 'error' && <p className={styles.dialogError}>{message}</p>}
            <div className={styles.dialogActions}>
              <button className={styles.secondaryButton} type="button" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                onClick={confirmDelete}
                disabled={deleteStatus === 'deleting'}
              >
                {deleteStatus === 'deleting' ? 'Deleting…' : 'Delete website'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function DashboardMessage({ children }) {
  return <section className={styles.message}>{children}</section>
}

function Status({ status }) {
  return <span className={`${styles.status} ${status === 'published' ? styles.published : ''}`}>{status}</span>
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTemplate(value) {
  return `${value.replace(/[-_]/g, ' ')} template`
}
