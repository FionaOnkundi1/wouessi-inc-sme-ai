// src/components/GeneratedSite.jsx
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SiteProvider } from '../site/SiteContext'
import EditPanel from '../site/edit/EditPanel'
import Navbar from '../site/components/Navbar'
import Footer from '../site/components/Footer'
import HomePage from '../site/pages/HomePage'
import ProductsPage from '../site/pages/ProductsPage'
import AboutPage from '../site/pages/AboutPage'
import ContactPage from '../site/pages/ContactPage'
import styles from './GeneratedSite.module.css'

export default function GeneratedSite({
  data,
  onRestart,
  onSave,
  onDataChange,
  onOpenDashboard,
  saveState,
  publishState,
  onPublish,
  onUnpublish,
  onCopyPublishUrl,
}) {
  const isPublished = data.status === 'published' && data.publishUrl
  const publishing = publishState.status === 'publishing' || publishState.status === 'unpublishing'

  return (
    <div className={styles.root}>
      {/* Floating demo chrome bar */}
      <div className={styles.demoBanner}>
        <div className={styles.bannerLeft}>
          <span className={styles.bannerUrl}>wouessi.site/{data.slug || 'my-business'}</span>
        </div>
        <div className={styles.bannerRight}>
          <div className={styles.seoPill}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="#639922" strokeWidth="1.2"/>
              <path d="M3 5l1.5 1.5L7 3.5" stroke="#639922" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            SEO ready
          </div>
          <span className={styles.editHint}>Hover any section to edit it</span>
          {data.owned && (
            <button className={styles.dashboardBtn} onClick={onOpenDashboard}>My websites</button>
          )}
          {data.owned && isPublished && (
            <>
              <a className={styles.liveBtn} href={data.publishUrl} target="_blank" rel="noreferrer">Open live</a>
              <button className={styles.copyBtn} type="button" onClick={onCopyPublishUrl}>Copy link</button>
            </>
          )}
          {data.owned && (
            <button className={styles.publishBtn} type="button" onClick={onPublish} disabled={publishing}>
              {publishState.status === 'publishing'
                ? isPublished ? 'Republishing…' : 'Publishing…'
                : isPublished ? 'Republish' : 'Publish'}
            </button>
          )}
          {data.owned && isPublished && (
            <button className={styles.unpublishBtn} type="button" onClick={onUnpublish} disabled={publishing}>
              {publishState.status === 'unpublishing' ? 'Unpublishing…' : 'Unpublish'}
            </button>
          )}
          <button
            className={`${styles.saveBtn} ${saveState.status === 'saved' ? styles.saveBtnDone : ''}`}
            onClick={onSave}
            disabled={saveState.status === 'saving' || saveState.status === 'saved'}
          >
            {saveState.status === 'saving'
              ? 'Saving…'
              : saveState.status === 'saved'
              ? 'Saved'
              : 'Save to account'}
          </button>
          <button className={styles.restartBtn} onClick={onRestart}>← Start over</button>
        </div>
      </div>
      {saveState.message && (
        <div className={`${styles.saveMessage} ${saveState.status === 'error' ? styles.saveMessageError : ''}`}>
          {saveState.message}
        </div>
      )}
      {publishState.message && (
        <div className={`${styles.publishMessage} ${publishState.status === 'error' ? styles.publishMessageError : ''}`}>
          {publishState.message}
        </div>
      )}

      {/* Full-page site with edit system */}
      <div className={styles.site}>
        <SiteProvider initialData={data} onDataChange={onDataChange}>
          <MemoryRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
            <Footer />
            <EditPanel />
          </MemoryRouter>
        </SiteProvider>
      </div>
    </div>
  )
}
