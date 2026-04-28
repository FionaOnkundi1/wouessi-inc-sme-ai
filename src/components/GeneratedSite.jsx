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

export default function GeneratedSite({ data, onRestart }) {
  return (
    <div className={styles.root}>
      {/* Floating demo chrome bar */}
      <div className={styles.demoBanner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerDots}>
            <span className={`${styles.dot} ${styles.red}`} />
            <span className={`${styles.dot} ${styles.yellow}`} />
            <span className={`${styles.dot} ${styles.green}`} />
          </div>
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
          <button className={styles.restartBtn} onClick={onRestart}>← Start over</button>
        </div>
      </div>

      {/* Full-page site with edit system */}
      <div className={styles.site}>
        <SiteProvider initialData={data}>
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
