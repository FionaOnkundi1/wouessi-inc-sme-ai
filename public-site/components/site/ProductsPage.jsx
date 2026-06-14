import Link from "next/link";
import { sitePath } from "../../lib/site";
import { extendedOfferings, productPageCopy } from "./content";
import styles from "./ProductsPage.module.css";

export default function ProductsPage({ slug, content }) {
  const products = extendedOfferings(content);
  const copy = productPageCopy(content.tag);

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div className={styles.inner}>
          <p className={styles.eye}>{copy.label} · {content.location}</p>
          <h1 className={styles.h1}>{copy.headline}</h1>
          <p className={styles.sub}>{copy.sub}</p>
        </div>
      </section>
      <div className={styles.statsBar}>
        <div className={styles.inner}>
          <div className={styles.stats}>
            <Stat value={products.length} label={`${copy.label.toLowerCase()} available`} />
            <div className={styles.statDivider} />
            <Stat value={`${content.volume || "50"}+`} label={content.unit || "customers served"} />
            <div className={styles.statDivider} />
            <Stat value="5★" label="average rating" />
          </div>
        </div>
      </div>
      <section className={styles.grid}>
        <div className={styles.inner}>
          <div className={styles.productGrid}>
            {products.map((product, index) => (
              <article key={`${product.name}-${index}`} className={`${styles.productCard} ${index < 3 ? styles.featured : ""}`}>
                {index < 3 && <span className={styles.featuredBadge}>✦ Top pick</span>}
                {product.badge && index >= 3 && <span className={styles.badge}>{product.badge}</span>}
                <div className={styles.productImg} style={{ background: product.bg }}>
                  <span className={styles.emoji}>{product.emoji}</span>
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productDesc}>Quality {product.name.toLowerCase()} tailored for customers in {content.location}.</div>
                  <div className={styles.productFooter}>
                    <span className={styles.price}>{product.price}</span>
                    <Link href={sitePath(slug, "contact")} className={styles.cardCta}>{copy.cardCta} →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.bottomCta}>
        <div className={styles.inner}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaH2}>Do not see what you need?</h2>
              <p className={styles.ctaDesc}>We do custom requests. Get in touch and we will make it work.</p>
            </div>
            <Link href={sitePath(slug, "contact")} className={styles.ctaBtn}>Contact us →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statNum}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
