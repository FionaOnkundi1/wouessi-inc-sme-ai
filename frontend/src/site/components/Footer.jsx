// src/site/components/Footer.jsx
import { NavLink } from 'react-router-dom'
import { useSite } from '../SiteContext'
import styles from './Footer.module.css'

export default function Footer() {
  const { data: { name, tag, location, keywords, footerYear } } = useSite()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>{name?.charAt(0) ?? 'W'}</div>
            <div>
              <div className={styles.brandName}>{name}</div>
              <div className={styles.brandSub}>{tag} · {location}</div>
            </div>
          </div>

          <div className={styles.cols}>
            <div className={styles.col}>
              <div className={styles.colTitle}>Navigate</div>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </div>
            <div className={styles.col}>
              <div className={styles.colTitle}>Business</div>
              <span>{tag}</span>
              <span>{location}</span>
              <span>Est. {footerYear}</span>
            </div>
            <div className={styles.col}>
              <div className={styles.colTitle}>Keywords</div>
              {keywords?.split(',').map((k, i) => (
                <span key={i}>{k.trim()}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {footerYear} {name}. All rights reserved.</span>
          <div className={styles.seoPill}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="#639922" strokeWidth="1"/>
              <path d="M3 5l1.5 1.5L7 3.5" stroke="#639922" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            SEO optimised
          </div>
        </div>
      </div>
    </footer>
  )
}
