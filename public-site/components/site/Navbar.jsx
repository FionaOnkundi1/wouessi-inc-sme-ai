import Link from "next/link";
import { sitePath } from "../../lib/site";
import { initial, isService } from "./content";
import styles from "./Navbar.module.css";

export default function Navbar({ slug, content, currentPage }) {
  const nav = [
    ["home", "Home"],
    ["products", isService(content.tag) ? "Services" : "Products"],
    ["about", "About"],
    ["contact", "Contact"]
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href={sitePath(slug)} className={styles.brand}>
          <div className={styles.logoMark} aria-hidden="true">{initial(content.name)}</div>
          <span className={styles.brandName}>{content.name}</span>
        </Link>
        <ul className={styles.links}>
          {nav.map(([page, label]) => (
            <li key={page}>
              <Link className={currentPage === page ? styles.active : ""} href={sitePath(slug, page)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={sitePath(slug, "contact")} className={styles.ctaBtn}>Get in Touch</Link>
      </nav>
    </header>
  );
}
