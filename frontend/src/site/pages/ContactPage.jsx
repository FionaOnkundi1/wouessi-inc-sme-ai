// src/site/pages/ContactPage.jsx
import { useState } from 'react'
import { useSite } from '../SiteContext'
import EditableSection from '../edit/EditableSection'
import styles from './ContactPage.module.css'

function getFAQ(data) {
  if (data.faq) return data.faq
  const { tag, name } = data
  const isService = /service|repair|clean|salon|tailor|tutor|coach/i.test(tag)
  const isFood = /food|produce|bake|farm/i.test(tag)
  if (isService) return [
    { q: 'How quickly can you respond?', a: 'We aim to reply within a few hours. For urgent jobs, call us directly.' },
    { q: 'Do you offer free quotes?', a: 'Yes — all initial consultations and quotes are completely free.' },
    { q: 'What areas do you cover?', a: 'We primarily serve our local area but can travel for larger projects.' },
    { q: 'Are your services guaranteed?', a: "Every job comes with our satisfaction guarantee. If it's not right, we fix it." },
  ]
  if (isFood) return [
    { q: 'When do you deliver?', a: "Deliveries run weekly. Order by Wednesday for that week's box." },
    { q: 'Can I customise my box?', a: "Yes — add notes at checkout and we'll do our best to accommodate." },
    { q: "What if something isn't fresh?", a: "Contact us and we'll replace it or credit your next order. No questions." },
    { q: 'Do you offer subscriptions?', a: 'Yes — subscribe and save 10% on every order.' },
  ]
  return [
    { q: 'Can I place a custom order?', a: "Absolutely. Get in touch with what you have in mind and we'll make it happen." },
    { q: 'How long does delivery take?', a: 'Standard delivery is 3-5 working days. Express options available on request.' },
    { q: "What's your return policy?", a: "If you're not happy, we'll make it right — replacement, refund, or credit." },
    { q: 'Do you do wholesale or bulk?', a: 'Yes — contact us for trade pricing and minimum order quantities.' },
  ]
}

export default function ContactPage() {
  const { data } = useSite()
  const { name, tag, location, contactEmail, contactPhone, openHours, responseTime } = data
  const faq = getFAQ(data)

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFAQ, setOpenFAQ] = useState(null)

  const email = contactEmail || `hello@${name?.toLowerCase().replace(/\s+/g, '')}.com`
  const hours = openHours || 'Mon-Sat, 8am-6pm'
  const response = responseTime || 'Within 24 hours'

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  function handleSubmit(e) { e.preventDefault(); setSubmitted(true) }

  return (
    <main className={styles.page}>

      <EditableSection
        sectionId="contact"
        title="Contact details"
        trackKeys={[location, email, hours]}
        questions={[
          { id: 'phone', label: 'What is your phone number?', placeholder: 'e.g. +61 4xx xxx xxx', hint: 'Voice tip: say "plus six one" for +61' },
          { id: 'email', label: 'What is your contact email?', placeholder: 'e.g. info@yourbusiness.com', hint: 'Voice tip: say "at" for @, "dot com" for .com' },
          { id: 'hours', label: 'What are your opening hours?', placeholder: 'e.g. Mon-Fri 9am-5pm, Saturday 10am-2pm' },
          { id: 'response', label: 'How fast do you typically respond?', placeholder: 'e.g. Within 2 hours during business days' },
        ]}
      >
        <section className={styles.pageHeader}>
          <div className={styles.inner}>
            <p className={styles.eye}>Get in touch</p>
            <h1 className={styles.h1}>We would love to hear from you</h1>
            <p className={styles.sub}>Whether you have a question, a custom request, or just want to say hello — we are real people and we respond personally.</p>
          </div>
        </section>
      </EditableSection>

      <section className={styles.contactSection}>
        <div className={styles.inner}>
          <div className={styles.contactGrid}>
            <div className={styles.formCol}>
              <h2 className={styles.colTitle}>Send a message</h2>
              {submitted ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>i</div>
                  <div className={styles.successTitle}>Demo form only</div>
                  <div className={styles.successDesc}>No message was sent. Visitors should contact the business using the verified details on this page.</div>
                  <button className={styles.resetBtn} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>Return to form</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <p className={styles.demoNotice}>Demo preview only. This form does not send messages.</p>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Your name</label>
                      <input className={styles.input} name="name" type="text" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Email address</label>
                      <input className={styles.input} name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Subject</label>
                    <input className={styles.input} name="subject" type="text" placeholder={`Question about ${name}`} value={form.subject} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Message</label>
                    <textarea className={styles.textarea} name="message" rows={5} placeholder="Tell us what you need..." value={form.message} onChange={handleChange} required />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={!form.name || !form.email || !form.message}>Test demo form →</button>
                </form>
              )}
            </div>

            <div className={styles.infoCol}>
              <h2 className={styles.colTitle}>Contact details</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}><div className={styles.infoIcon}>📍</div><div><div className={styles.infoLabel}>Location</div><div className={styles.infoValue}>{location}</div></div></div>
                <div className={styles.infoItem}><div className={styles.infoIcon}>⏱️</div><div><div className={styles.infoLabel}>Response time</div><div className={styles.infoValue}>{response}</div></div></div>
                <div className={styles.infoItem}><div className={styles.infoIcon}>📅</div><div><div className={styles.infoLabel}>Open hours</div><div className={styles.infoValue}>{hours}</div></div></div>
                <div className={styles.infoItem}><div className={styles.infoIcon}>✉️</div><div><div className={styles.infoLabel}>Email</div><div className={styles.infoValue}>{email}</div></div></div>
                {contactPhone && <div className={styles.infoItem}><div className={styles.infoIcon}>📞</div><div><div className={styles.infoLabel}>Phone</div><div className={styles.infoValue}>{contactPhone}</div></div></div>}
              </div>
              <div className={styles.mapBox}>
                <div className={styles.mapPlaceholder}>
                  <span className={styles.mapPin}>📍</span>
                  <span className={styles.mapLabel}>{location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EditableSection
        sectionId="faq"
        title="FAQ"
        trackKeys={faq.map(f => f.q)}
        questions={[
          { id: 'common', label: 'What questions do customers ask most often?', placeholder: 'e.g. Do you deliver? How long does it take? Can I get a custom order?', hint: 'List as many as you like — we will turn them into proper FAQ answers.' },
          { id: 'policies', label: 'Any important policies to mention?', placeholder: 'e.g. No refunds on custom orders, free delivery over $50, cash only' },
        ]}
      >
        <section className={styles.faq}>
          <div className={styles.inner}>
            <p className={styles.eye}>FAQ</p>
            <h2 className={styles.h2}>Common questions</h2>
            <div className={styles.faqList}>
              {faq.map((item, i) => (
                <div key={i} className={`${styles.faqItem} ${openFAQ === i ? styles.open : ''}`}>
                  <button className={styles.faqQ} onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                    <span>{item.q}</span>
                    <span className={styles.faqChevron}>{openFAQ === i ? '−' : '+'}</span>
                  </button>
                  {openFAQ === i && <div className={styles.faqA}>{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>
    </main>
  )
}
