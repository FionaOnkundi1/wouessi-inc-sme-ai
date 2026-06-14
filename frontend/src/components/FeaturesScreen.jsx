import styles from './FeaturesScreen.module.css'

const FEATURE_GROUPS = [
  {
    label: 'Input',
    title: 'Voice and text business capture',
    description: 'Start with a short description, spoken or typed. Wouessi turns the first idea into a structured business brief.',
  },
  {
    label: 'Questions',
    title: 'Follow-up details that shape the site',
    description: 'The guided questions collect services, customers, pricing, contact details, location, hours, and what makes the business different.',
  },
  {
    label: 'AI',
    title: 'Business extraction and template matching',
    description: 'The AI reads the full conversation, identifies the business type, and selects a suitable website style for retail, trade, hospitality, or professional services.',
  },
  {
    label: 'Preview',
    title: 'Editable website draft',
    description: 'The generated site includes homepage copy, products or services, about content, contact details, SEO metadata, and hover-to-edit sections.',
  },
]

const WORKFLOW_STEPS = [
  'Describe the business',
  'Answer targeted follow-up questions',
  'Generate the draft with AI',
  'Preview, edit, and save the website',
]

const BUILT_FOR = [
  'Local service businesses',
  'Retail shops and makers',
  'Restaurants and hospitality teams',
  'Consultants and professional services',
]

export default function FeaturesScreen({ onHome, onStart, onTemplates }) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Features navigation">
        <button type="button" className={styles.logoButton} onClick={onHome} aria-label="Go to homepage">
          <img src="/logo.png" alt="Wouessi Inc." className={styles.logo} />
        </button>
        <div className={styles.navActions}>
          <button type="button" className={styles.navLink} onClick={onTemplates}>Templates</button>
          <button type="button" className={styles.navCta} onClick={onStart}>Start building</button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Features</p>
          <h1>From business idea to editable website draft.</h1>
          <p>
            Wouessi helps small businesses create a useful website preview from a natural conversation,
            then turns captured details into structured pages, contact information, products, and SEO-ready content.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryBtn} onClick={onStart}>Try the generator</button>
            <button type="button" className={styles.secondaryBtn} onClick={onTemplates}>Preview templates</button>
          </div>
        </div>

        <div className={styles.flowPanel} aria-label="Website generation workflow">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step} className={styles.flowStep}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.featureGrid} aria-label="Core features">
        {FEATURE_GROUPS.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <span className={styles.featureLabel}>{feature.label}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className={styles.detailBand}>
        <div className={styles.detailCopy}>
          <p className={styles.eyebrow}>Generated content</p>
          <h2>Captures the details that usually get missed.</h2>
          <p>
            The generator uses the homepage input and follow-up answers together, so the finished preview can include
            real services, pricing hints, opening hours, phone numbers, email addresses, location, and business positioning.
          </p>
        </div>
        <div className={styles.detailList}>
          <span>Services and product cards</span>
          <span>Opening hours and contact details</span>
          <span>Target customer and unique value</span>
          <span>SEO title, description, and keywords</span>
        </div>
      </section>

      <section className={styles.audienceSection} aria-label="Business types">
        <div>
          <p className={styles.eyebrow}>Built for</p>
          <h2>Flexible enough for different small business styles.</h2>
        </div>
        <div className={styles.audienceGrid}>
          {BUILT_FOR.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  )
}
