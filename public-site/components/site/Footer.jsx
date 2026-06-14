import Link from "next/link";
import { sitePath } from "../../lib/site";
import { initial, isService } from "./content";
import styles from "./Footer.module.css";

export default function Footer({ slug, content }) {
  const keywords = String(content.keywords || "").split(",").map((value) => value.trim()).filter(Boolean);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>{initial(content.name)}</div>
            <div>
              <div className={styles.brandName}>{content.name}</div>
              <div className={styles.brandSub}>{content.tag} · {content.location}</div>
            </div>
          </div>
          <div className={styles.cols}>
            <div className={styles.col}>
              <div className={styles.colTitle}>Navigate</div>
              <Link href={sitePath(slug)}>Home</Link>
              <Link href={sitePath(slug, "products")}>{isService(content.tag) ? "Services" : "Products"}</Link>
              <Link href={sitePath(slug, "about")}>About</Link>
              <Link href={sitePath(slug, "contact")}>Contact</Link>
            </div>
            <div className={styles.col}>
              <div className={styles.colTitle}>Business</div>
              <span>{content.tag}</span>
              <span>{content.location}</span>
              <span>Est. {content.footerYear || new Date().getFullYear()}</span>
            </div>
            <div className={styles.col}>
              <div className={styles.colTitle}>Keywords</div>
              {keywords.slice(0, 4).map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {content.footerYear || new Date().getFullYear()} {content.name}. All rights reserved.</span>
          <div className={styles.seoPill}>✓ SEO optimised</div>
        </div>
      </div>
    </footer>
  );
}
