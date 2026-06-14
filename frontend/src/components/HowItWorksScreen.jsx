import styles from './HowItWorksScreen.module.css'

const STEPS = [
  {
    number: '01',
    title: 'Start with the business in plain language',
    user: 'The user types or records what the business does, where it operates, and the kind of website they need.',
    system: 'Wouessi keeps this as the foundation for the draft instead of treating it as a throwaway prompt.',
  },
  {
    number: '02',
    title: 'Answer only the details needed for a stronger draft',
    user: 'The follow-up screen asks targeted questions about offerings, customers, contact details, pricing, and business personality.',
    system: 'The answers are combined with the original input before the website is generated.',
  },
  {
    number: '03',
    title: 'Review the generated website preview',
    user: 'The user sees a complete draft with pages, sections, navigation, content, contact details, and a matching visual direction.',
    system: 'The preview is built from structured business data, so it can be edited and saved more easily.',
  },
  {
    number: '04',
    title: 'Refine, save, or start again',
    user: 'The user can edit sections in the preview, save the draft to an account, or restart with a better prompt.',
    system: 'Drafts can be claimed by signed-in users when account saving is configured.',
  },
]

const EXPECTATIONS = [
  'A short first input is enough to start.',
  'Specific follow-up answers create a much better preview.',
  'Contact details and opening hours should be written clearly.',
  'The draft is a starting point, not the final business website.',
]

export default function HowItWorksScreen({ onHome, onStart, onFeatures, onTemplates }) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="How it works navigation">
        <button type="button" className={styles.logoButton} onClick={onHome} aria-label="Go to homepage">
          <img src="/logo.png" alt="Wouessi Inc." className={styles.logo} />
        </button>
        <div className={styles.navActions}>
          <button type="button" className={styles.navLink} onClick={onFeatures}>Features</button>
          <button type="button" className={styles.navLink} onClick={onTemplates}>Templates</button>
          <button type="button" className={styles.navCta} onClick={onStart}>Start building</button>
        </div>
      </nav>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>How It Works</p>
        <h1>A simple path from rough notes to a working draft.</h1>
        <p>
          The app guides the user through one focused flow: describe the business, add missing details,
          generate a preview, then refine the result.
        </p>
      </section>

      <section className={styles.timeline} aria-label="Website generation steps">
        {STEPS.map((step) => (
          <article key={step.number} className={styles.stepCard}>
            <span className={styles.stepNumber}>{step.number}</span>
            <div className={styles.stepBody}>
              <h2>{step.title}</h2>
              <div className={styles.stepColumns}>
                <div>
                  <span>User does</span>
                  <p>{step.user}</p>
                </div>
                <div>
                  <span>App does</span>
                  <p>{step.system}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.noteBand}>
        <div>
          <p className={styles.eyebrow}>Before generating</p>
          <h2>What makes the result better?</h2>
        </div>
        <div className={styles.expectations}>
          {EXPECTATIONS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  )
}
