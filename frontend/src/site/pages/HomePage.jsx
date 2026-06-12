// src/site/pages/HomePage.jsx
import { Link } from 'react-router-dom'
import { useSite } from '../SiteContext'
import EditableSection from '../edit/EditableSection'
import styles from './HomePage.module.css'

function getFeatures(data) {
  if (data.features) return data.features
  const { tag, location } = data
  const isService = /service|repair|clean|salon|tailor|tutor|coach/i.test(tag)
  const isFood = /food|produce|bake|farm/i.test(tag)
  if (isService) return [
    { icon: '⚡', title: 'Fast Turnaround', body: `Same-day service available across ${location}.` },
    { icon: '🛡️', title: 'Quality Guaranteed', body: 'Every job backed by our satisfaction guarantee.' },
    { icon: '📍', title: 'Locally Rooted', body: `Proudly serving ${location} and surrounding areas.` },
    { icon: '💬', title: 'Always Responsive', body: 'Reach us by phone, message or walk-in — we answer fast.' },
  ]
  if (isFood) return [
    { icon: '🌱', title: 'Locally Sourced', body: `Produce picked fresh from farms near ${location}.` },
    { icon: '📦', title: 'Weekly Delivery', body: 'Reliable door-to-door delivery on a schedule that suits you.' },
    { icon: '✅', title: 'Certified Quality', body: 'Every batch meets our strict freshness standards.' },
    { icon: '♻️', title: 'Sustainable Packaging', body: 'Minimal waste, 100% recyclable materials.' },
  ]
  return [
    { icon: '✨', title: 'Handcrafted Quality', body: 'Every item made with care and attention to detail.' },
    { icon: '📦', title: 'Fast Dispatch', body: 'Orders packed and shipped within 24-48 hours.' },
    { icon: '📍', title: `Made in ${location}`, body: 'Proudly local, available worldwide.' },
    { icon: '💬', title: 'Personal Service', body: 'Talk directly to the maker — not a call centre.' },
  ]
}

function getTestimonials(data) {
  if (data.testimonials) return data.testimonials
  const { location, tag } = data
  return [
    { name: 'Amara D.', location, text: `Best ${tag.toLowerCase()} I have found. The quality is outstanding and delivery was faster than expected.`, rating: 5 },
    { name: 'James K.', location, text: 'Incredibly professional and reliable. I recommend them to everyone I know.', rating: 5 },
    { name: 'Sofia M.', location, text: 'Discovered them through a friend and have not looked back since. Genuinely brilliant.', rating: 5 },
  ]
}

function Stars({ count }) {
  return <div className={styles.stars}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</div>
}

export default function HomePage() {
  const { data } = useSite()
  const { name, tagline, tag, desc, location, volume, unit, products, seoTitle, seoDesc } = data
  const features = getFeatures(data)
  const testimonials = getTestimonials(data)
  const isService = /service|repair|clean|salon|tailor|tutor|coach/i.test(tag)

  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <EditableSection
        sectionId="hero"
        title="Hero section"
        trackKeys={[tagline, desc]}
        questions={[
          { id: 'tagline', label: 'What is your main headline?', placeholder: 'e.g. Handcrafted candles made with love in Melbourne', hint: 'Keep it short and compelling — under 10 words.' },
          { id: 'diff', label: 'What makes you different from competitors?', placeholder: 'e.g. We use only natural soy wax and locally sourced botanicals', hint: 'This shapes your description and pitch.' },
          { id: 'cta', label: 'What action do you want visitors to take?', placeholder: 'e.g. Browse our range, Book a consultation, Order online' },
        ]}
      >
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.pill}>{tag} · {location}</span>
            <h1 className={styles.h1}>{tagline}</h1>
            <p className={styles.heroDesc}>{desc}</p>
            <div className={styles.heroActions}>
              <Link to="/products" className={styles.btnPrimary}>
                Browse {isService ? 'Services' : 'Products'}
              </Link>
              <Link to="/contact" className={styles.btnSecondary}>Get in Touch</Link>
            </div>
            <div className={styles.heroMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaNum}>{volume}+</span>
                <span className={styles.metaLabel}>{unit}</span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaItem}>
                <span className={styles.metaNum}>5★</span>
                <span className={styles.metaLabel}>average rating</span>
              </div>
              <div className={styles.metaDivider} />
              <div className={styles.metaItem}>
                <span className={styles.metaNum}>100%</span>
                <span className={styles.metaLabel}>satisfaction</span>
              </div>
            </div>
          </div>
          <div className={styles.heroBg} aria-hidden="true">
            <div className={styles.heroBgBlob1} />
            <div className={styles.heroBgBlob2} />
          </div>
        </section>
      </EditableSection>

      {/* ── Featured products ── */}
      <EditableSection
        sectionId="products"
        title="Featured products"
        trackKeys={products.map(p => p.name)}
        questions={[
          { id: 'products', label: 'List your main products or services', placeholder: 'e.g. Soy pillar candle $24, Gift bundle $55, Room spray $18', hint: 'Include name and price for each. Separate with commas or new lines.' },
          { id: 'currency', label: 'What currency do you use?', placeholder: 'e.g. AUD, USD, NGN, KES, ZAR' },
        ]}
      >
        <section className={styles.featuredStrip}>
          <div className={styles.inner}>
            <div className={styles.stripHeader}>
              <p className={styles.sectionEye}>Featured</p>
              <h2 className={styles.h2}>Our top picks</h2>
              <Link to="/products" className={styles.viewAll}>View all →</Link>
            </div>
            <div className={styles.productGrid}>
              {products.map((p, i) => (
                <div key={i} className={styles.productCard}>
                  <div className={styles.productImg} style={{ background: p.bg }}>
                    <span className={styles.productEmoji}>{p.emoji}</span>
                  </div>
                  <div className={styles.productBody}>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productPrice}>{p.price}</div>
                  </div>
                  <Link to="/contact" className={styles.productCta}>Order →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ── Features ── */}
      <EditableSection
        sectionId="features"
        title="Why choose us"
        trackKeys={features.map(f => f.title)}
        questions={[
          { id: 'strengths', label: 'What are your 3-4 biggest strengths?', placeholder: 'e.g. Same-day service, 5-year warranty, locally made, free delivery', hint: 'Be specific — vague answers produce vague results.' },
          { id: 'guarantee', label: 'Do you offer any guarantee or promise?', placeholder: 'e.g. Satisfaction guarantee, free returns within 30 days' },
        ]}
      >
        <section className={styles.features}>
          <div className={styles.inner}>
            <p className={styles.sectionEye}>Why {name}</p>
            <h2 className={styles.h2}>Built on trust, delivered with care</h2>
            <div className={styles.featureGrid}>
              {features.map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureBody}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ── Testimonials ── */}
      <EditableSection
        sectionId="testimonials"
        title="Customer testimonials"
        trackKeys={testimonials.map(t => t.name)}
        questions={[
          { id: 'feedback', label: 'What do customers most often say about you?', placeholder: 'e.g. Fast, reliable, great quality, friendly service', hint: 'Real feedback makes testimonials feel authentic.' },
          { id: 'customers', label: 'Who are your typical customers?', placeholder: 'e.g. Young professionals, local families, small businesses, restaurants' },
        ]}
      >
        <section className={styles.testimonials}>
          <div className={styles.inner}>
            <p className={styles.sectionEye}>What people say</p>
            <h2 className={styles.h2}>Loved by customers in {location}</h2>
            <div className={styles.testimonialGrid}>
              {testimonials.map((t, i) => (
                <div key={i} className={styles.testimonialCard}>
                  <Stars count={t.rating} />
                  <p className={styles.testimonialText}>"{t.text}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.avatar}>{t.name.charAt(0)}</div>
                    <div>
                      <div className={styles.authorName}>{t.name}</div>
                      <div className={styles.authorLoc}>{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ── CTA ── */}
      <EditableSection
        sectionId="hero"
        title="Call to action"
        trackKeys={[tagline]}
        questions={[
          { id: 'urgency', label: 'Is there a special offer or reason to act now?', placeholder: 'e.g. Free delivery this week, 10% off first order, limited stock' },
          { id: 'cta', label: 'What should visitors do?', placeholder: 'e.g. Call us, place an order, book a free consultation' },
        ]}
      >
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaH2}>Ready to get started?</h2>
            <p className={styles.ctaDesc}>
              Join {volume}+ satisfied customers in {location}. Reach out today and we will get back to you within 24 hours.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/contact" className={styles.ctaBtnPrimary}>Contact us now</Link>
              <Link to="/about" className={styles.ctaBtnGhost}>Learn about us</Link>
            </div>
          </div>
        </section>
      </EditableSection>

      <div style={{ display: 'none' }} aria-hidden="true">
        <span data-seo-title={seoTitle} /><span data-seo-desc={seoDesc} />
      </div>
    </main>
  )
}
