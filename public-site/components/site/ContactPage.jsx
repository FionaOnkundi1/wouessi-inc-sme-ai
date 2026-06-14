import { faqs } from "./content";
import styles from "./ContactPage.module.css";

export default function ContactPage({ content }) {
  const faqItems = faqs(content);
  const email = content.contactEmail || "";
  const phone = content.contactPhone || "";

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div className={styles.inner}>
          <p className={styles.eye}>Get in touch</p>
          <h1 className={styles.h1}>We would love to hear from you</h1>
          <p className={styles.sub}>Whether you have a question, a custom request, or just want to say hello, use the verified contact details below.</p>
        </div>
      </section>
      <section className={styles.contactSection}>
        <div className={styles.inner}>
          <div className={styles.contactGrid}>
            <div className={styles.formCol}>
              <h2 className={styles.colTitle}>Send a message</h2>
              <div className={styles.successBox}>
                <div className={styles.successIcon}>i</div>
                <div className={styles.successTitle}>Contact form coming soon</div>
                <div className={styles.successDesc}>This published website does not currently send form submissions. Please use the listed email or phone details.</div>
                {email && <a className={styles.resetBtn} href={`mailto:${email}`}>Email {content.name}</a>}
              </div>
            </div>
            <div className={styles.infoCol}>
              <h2 className={styles.colTitle}>Contact details</h2>
              <div className={styles.infoList}>
                <Info icon="📍" label="Location" value={content.location} />
                <Info icon="⏱️" label="Response time" value={content.responseTime || "Within 24 hours"} />
                <Info icon="📅" label="Open hours" value={content.openHours || "Contact us for availability"} />
                <Info icon="✉️" label="Email" value={email} href={email ? `mailto:${email}` : undefined} />
                <Info icon="📞" label="Phone" value={phone} href={phone ? `tel:${phone}` : undefined} />
              </div>
              <div className={styles.mapBox}>
                <div className={styles.mapPlaceholder}>
                  <span className={styles.mapPin}>📍</span>
                  <span className={styles.mapLabel}>{content.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className={styles.inner}>
          <p className={styles.eye}>FAQ</p>
          <h2 className={styles.h2}>Common questions</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQ}>{item.q}<span className={styles.faqChevron}>+</span></summary>
                <div className={styles.faqA}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className={styles.infoItem}>
      <div className={styles.infoIcon}>{icon}</div>
      <div>
        <div className={styles.infoLabel}>{label}</div>
        <div className={styles.infoValue}>{href ? <a href={href}>{value}</a> : value}</div>
      </div>
    </div>
  );
}
