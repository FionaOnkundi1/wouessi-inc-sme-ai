import Link from "next/link";
import { sitePath } from "../../lib/site";
import { features, isService, offerings, testimonials } from "./content";
import styles from "./HomePage.module.css";

export default function HomePage({ slug, content }) {
  const products = offerings(content);
  const featureItems = features(content);
  const testimonialItems = testimonials(content);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.pill}>{content.tag} · {content.location}</span>
          <h1 className={styles.h1}>{content.tagline || content.name}</h1>
          <p className={styles.heroDesc}>{content.desc}</p>
          <div className={styles.heroActions}>
            <Link href={sitePath(slug, "products")} className={styles.btnPrimary}>
              Browse {isService(content.tag) ? "Services" : "Products"}
            </Link>
            <Link href={sitePath(slug, "contact")} className={styles.btnSecondary}>Get in Touch</Link>
          </div>
          <div className={styles.heroMeta}>
            <Meta value={`${content.volume || "50"}+`} label={content.unit || "customers served"} />
            <div className={styles.metaDivider} />
            <Meta value="5★" label="average rating" />
            <div className={styles.metaDivider} />
            <Meta value="100%" label="satisfaction" />
          </div>
        </div>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBgBlob1} />
          <div className={styles.heroBgBlob2} />
        </div>
      </section>

      <section className={styles.featuredStrip}>
        <div className={styles.inner}>
          <div className={styles.stripHeader}>
            <div>
              <p className={styles.sectionEye}>Featured</p>
              <h2 className={styles.h2}>Our top picks</h2>
            </div>
            <Link href={sitePath(slug, "products")} className={styles.viewAll}>View all →</Link>
          </div>
          <div className={styles.productGrid}>
            {products.map((product, index) => (
              <div key={`${product.name}-${index}`} className={styles.productCard}>
                <div className={styles.productImg} style={{ background: product.bg }}>
                  <span className={styles.productEmoji}>{product.emoji}</span>
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productPrice}>{product.price}</div>
                </div>
                <Link href={sitePath(slug, "contact")} className={styles.productCta}>
                  {isService(content.tag) ? "Enquire" : "Order"} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.inner}>
          <div>
            <p className={styles.sectionEye}>Why {content.name}</p>
            <h2 className={styles.h2}>Built on trust, delivered with care</h2>
          </div>
          <div className={styles.featureGrid}>
            {featureItems.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <div className={styles.featureTitle}>{feature.title}</div>
                <div className={styles.featureBody}>{feature.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.inner}>
          <div>
            <p className={styles.sectionEye}>What people say</p>
            <h2 className={styles.h2}>Loved by customers in {content.location}</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {testimonialItems.map((testimonial) => (
              <div key={testimonial.name} className={styles.testimonialCard}>
                <div className={styles.stars}>{"★".repeat(testimonial.rating || 5)}</div>
                <p className={styles.testimonialText}>&ldquo;{testimonial.text}&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.avatar}>{testimonial.name.charAt(0)}</div>
                  <div>
                    <div className={styles.authorName}>{testimonial.name}</div>
                    <div className={styles.authorLoc}>{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaH2}>Ready to get started?</h2>
          <p className={styles.ctaDesc}>
            Join {content.volume || "50"}+ satisfied customers in {content.location}. Reach out today and we will get back to you within 24 hours.
          </p>
          <div className={styles.ctaActions}>
            <Link href={sitePath(slug, "contact")} className={styles.ctaBtnPrimary}>Contact us now</Link>
            <Link href={sitePath(slug, "about")} className={styles.ctaBtnGhost}>Learn about us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Meta({ value, label }) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaNum}>{value}</span>
      <span className={styles.metaLabel}>{label}</span>
    </div>
  );
}
