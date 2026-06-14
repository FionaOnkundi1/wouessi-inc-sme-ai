import { TEMPLATE_PREVIEWS } from '../data/templatePreviews'
import styles from './TemplatePreviewScreen.module.css'

export default function TemplatePreviewScreen({ onBack, onPreview }) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <img src="/logo.png" alt="Wouessi Inc." className={styles.logo} />
        <button className={styles.backBtn} onClick={onBack}>Back</button>
      </nav>

      <section className={styles.header}>
        <p className={styles.eyebrow}>Template previews</p>
        <h1 className={styles.title}>Preview generated website styles</h1>
      </section>

      <section className={styles.grid} aria-label="Template previews">
        {TEMPLATE_PREVIEWS.map((template) => (
          <article key={template.id} className={styles.card}>
            <div className={`${styles.preview} ${styles[template.id]}`}>
              <div className={styles.previewNav}>
                <span className={styles.mark}>{template.data.name.charAt(0)}</span>
                <span>{template.data.name}</span>
              </div>
              <div className={styles.previewHero}>
                <span className={styles.previewPill}>{template.data.tag}</span>
                <h2>{template.data.tagline}</h2>
                <p>{template.data.desc}</p>
              </div>
              <div className={styles.previewProducts}>
                {template.data.products.map((product) => (
                  <div key={product.name} className={styles.productMini}>
                    <span>{product.emoji}</span>
                    <strong>{product.name}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cardBody}>
              <div>
                <h2 className={styles.cardTitle}>{template.label}</h2>
                <p className={styles.summary}>{template.summary}</p>
              </div>
              <button className={styles.previewBtn} onClick={() => onPreview(template.data)}>
                Open preview
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
