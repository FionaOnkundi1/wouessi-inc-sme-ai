// src/site/components/Navbar.jsx
import { NavLink } from 'react-router-dom'
import { useSite } from '../SiteContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { data: { name, tag } } = useSite()

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand}>
          <div className={styles.logoMark} aria-hidden="true">
            {name?.charAt(0) ?? 'W'}
          </div>
          <span className={styles.brandName}>{name}</span>
        </NavLink>

        <ul className={styles.links}>
          <li><NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''} end>Home</NavLink></li>
          <li><NavLink to="/products" className={({ isActive }) => isActive ? styles.active : ''}>
            {tag === 'Service business' || tag === 'Professional/Freelance' ? 'Services' : 'Products'}
          </NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>About</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => isActive ? styles.active : ''}>Contact</NavLink></li>
        </ul>

        <NavLink to="/contact" className={styles.ctaBtn}>Get in Touch</NavLink>
      </nav>
    </header>
  )
}
