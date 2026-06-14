// src/site/pages/ProductsPage.jsx
import { Link } from 'react-router-dom'
import { useSite } from '../SiteContext'
import EditableSection from '../edit/EditableSection'
import styles from './ProductsPage.module.css'

function getPageCopy(tag) {
  const isService = /service|repair|clean|salon|tailor|tutor|coach/i.test(tag)
  const isFood = /food|produce|bake|farm/i.test(tag)
  if (isService) return { label: 'Services', headline: 'Everything we offer', sub: 'Browse our full range of services. Every job is handled with care and backed by our quality guarantee.', cardCta: 'Book this service', badge: 'Service' }
  if (isFood) return { label: 'Products', headline: 'Fresh from our hands to yours', sub: 'Seasonal, locally sourced goods — available every week. Order yours before we sell out.', cardCta: 'Order now', badge: 'Available now' }
  return { label: 'Products', headline: 'Our full collection', sub: 'Handpicked, quality-checked, and ready to ship. Browse everything we make and sell.', cardCta: 'Enquire', badge: 'In stock' }
}

function extendProducts(products, tag) {
  if (products.length >= 6) return products

  const isService = /service|repair|clean|salon|tailor|tutor|coach/i.test(tag)
  const extras = isService
    ? [
        { name: 'Emergency Call-Out', price: 'POA', emoji: '🚨', bg: '#fcebeb', badge: 'Priority' },
        { name: 'Monthly Maintenance', price: 'From $99/mo', emoji: '📅', bg: '#e6f1fb', badge: 'Popular' },
        { name: 'Consultation', price: 'Free', emoji: '🤝', bg: '#eaf3de', badge: 'No charge' },
      ]
    : [
        { name: 'Custom Order', price: 'POA', emoji: '🎨', bg: '#fbeaf0', badge: 'Bespoke' },
        { name: 'Bulk / Wholesale', price: 'Contact us', emoji: '📦', bg: '#e6f1fb', badge: 'Trade' },
        { name: 'Gift Voucher', price: 'From $20', emoji: '🎁', bg: '#eaf3de', badge: 'Gift' },
      ]
  return [...products, ...extras].slice(0, 6)
}

export default function ProductsPage() {
  const { data } = useSite()
  const { tag, location, volume, unit, products, keywords } = data
  const copy = getPageCopy(tag)
  const allProducts = extendProducts(products, tag)

  return (
    <main className={styles.page}>

      <EditableSection
        sectionId="products"
        title="Products & services"
        trackKeys={products.map(p => p.name + p.price)}
        questions={[
          { id: 'products', label: 'List your products or services with prices', placeholder: 'e.g. Screen repair $89, Battery swap $49, Full diagnostic $25', hint: 'Name and price for each, separated by commas or new lines.' },
          { id: 'bestseller', label: 'Which is your most popular offering?', placeholder: 'e.g. The screen replacement — accounts for 60% of our work' },
          { id: 'currency', label: 'What currency should prices show in?', placeholder: 'e.g. AUD, USD, NGN, KES' },
        ]}
      >
        <section className={styles.pageHeader}>
          <div className={styles.inner}>
            <p className={styles.eye}>{copy.label} · {location}</p>
            <h1 className={styles.h1}>{copy.headline}</h1>
            <p className={styles.sub}>{copy.sub}</p>
          </div>
        </section>
      </EditableSection>

      <div className={styles.statsBar}>
        <div className={styles.inner}>
          <div className={styles.stats}>
            <div className={styles.stat}><span className={styles.statNum}>{allProducts.length}</span><span className={styles.statLabel}>{copy.label.toLowerCase()} available</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>{volume}+</span><span className={styles.statLabel}>{unit}</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>5★</span><span className={styles.statLabel}>average rating</span></div>
          </div>
        </div>
      </div>

      <section className={styles.grid}>
        <div className={styles.inner}>
          <div className={styles.productGrid}>
            {allProducts.map((p, i) => (
              <div key={i} className={`${styles.productCard} ${i < 3 ? styles.featured : ''}`}>
                {i < 3 && <span className={styles.featuredBadge}>✦ Top pick</span>}
                {p.badge && i >= 3 && <span className={styles.badge}>{p.badge}</span>}
                <div className={styles.productImg} style={{ background: p.bg }}>
                  <span className={styles.emoji}>{p.emoji}</span>
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productDesc}>Quality {p.name.toLowerCase()} tailored for customers in {location}.</div>
                  <div className={styles.productFooter}>
                    <span className={styles.price}>{p.price}</span>
                    <Link to="/contact" className={styles.cardCta}>{copy.cardCta} →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bottomCta}>
        <div className={styles.inner}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaH2}>Don't see what you need?</h2>
              <p className={styles.ctaDesc}>We do custom orders. Get in touch and we will make it work.</p>
            </div>
            <Link to="/contact" className={styles.ctaBtn}>Contact us →</Link>
          </div>
        </div>
      </section>

      <div style={{ display: 'none' }} aria-hidden="true">{keywords}</div>
    </main>
  )
}
