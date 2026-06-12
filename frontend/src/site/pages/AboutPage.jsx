// src/site/pages/AboutPage.jsx
import { Link } from 'react-router-dom'
import { useSite } from '../SiteContext'
import EditableSection from '../edit/EditableSection'
import styles from './AboutPage.module.css'

function getValues(data) {
  if (data.values) return data.values
  const { tag } = data
  const isService = /service|repair|clean|salon|tailor|tutor|coach/i.test(tag)
  const isFood = /food|produce|bake|farm/i.test(tag)
  if (isService) return [
    { icon: '🎯', title: 'Precision', body: 'We treat every job as if it were our own. No shortcuts.' },
    { icon: '⏱️', title: 'Punctuality', body: 'We show up when we say we will and finish when we promise.' },
    { icon: '💬', title: 'Transparency', body: 'Clear pricing, honest timelines, no hidden fees.' },
  ]
  if (isFood) return [
    { icon: '🌱', title: 'Freshness', body: 'Harvested close to delivery — never sitting in cold storage for weeks.' },
    { icon: '🤝', title: 'Community', body: 'We pay fair prices to farmers and pass fair prices to customers.' },
    { icon: '♻️', title: 'Sustainability', body: 'Every box, bag and label is recyclable or compostable.' },
  ]
  return [
    { icon: '✨', title: 'Craft', body: "We take pride in every item — if it's not right, we make it right." },
    { icon: '💬', title: 'Honesty', body: 'Straightforward pricing and honest communication, always.' },
    { icon: '🌍', title: 'Community', body: 'Local roots, global reach. Proud of where we come from.' },
  ]
}

const TIMELINE = [
  { year: '2019', label: 'Founded', desc: 'Started with one idea and a lot of determination.' },
  { year: '2021', label: 'Grew the team', desc: 'Demand grew — so did we. Added our first staff members.' },
  { year: '2023', label: 'Expanded range', desc: 'Launched new products and services based on customer feedback.' },
  { year: '2025', label: 'Online & growing', desc: 'Now reaching customers across the region and beyond.' },
]

export default function AboutPage() {
  const { data } = useSite()
  const { name, tag, about, location, volume, unit } = data
  const values = getValues(data)

  return (
    <main className={styles.page}>

      <EditableSection
        sectionId="about"
        title="Mission & story"
        trackKeys={[about, volume, unit]}
        questions={[
          { id: 'story', label: 'How did the business start?', placeholder: 'e.g. I started making candles at home during lockdown and friends kept asking to buy them', hint: 'A personal story is more compelling than a corporate summary.' },
          { id: 'mission', label: 'What is your mission in one sentence?', placeholder: 'e.g. To make artisan candles accessible to everyone in Melbourne' },
          { id: 'volume', label: 'How much do you produce or serve per week?', placeholder: 'e.g. 80 candles, 40 clients, 200 orders' },
        ]}
      >
        <section className={styles.pageHeader}>
          <div className={styles.inner}>
            <p className={styles.eye}>Our story</p>
            <h1 className={styles.h1}>About {name}</h1>
            <p className={styles.sub}>{about}</p>
          </div>
        </section>
      </EditableSection>

      <section className={styles.mission}>
        <div className={styles.inner}>
          <div className={styles.missionGrid}>
            <div className={styles.missionText}>
              <p className={styles.eye}>Our mission</p>
              <h2 className={styles.h2}>Why we do what we do</h2>
              <p className={styles.body}>
                {name} was built on a simple belief: that {location.split(',')[0]} deserves access to quality {tag.toLowerCase()} without compromising on price, service, or convenience.
              </p>
              <p className={styles.body} style={{ marginTop: 12 }}>
                We started small — just one person with a skill and a commitment to doing it well. Today we serve {volume}+ customers every week, but that original commitment has not changed.
              </p>
              <Link to="/contact" className={styles.missionCta}>Work with us →</Link>
            </div>
            <div className={styles.missionStats}>
              <div className={styles.statCard}><div className={styles.statNum}>{volume}+</div><div className={styles.statLabel}>{unit}</div></div>
              <div className={styles.statCard}><div className={styles.statNum}>5★</div><div className={styles.statLabel}>avg rating</div></div>
              <div className={styles.statCard}><div className={styles.statNum}>100%</div><div className={styles.statLabel}>satisfaction</div></div>
              <div className={styles.statCard}><div className={styles.statNum}>{location.split(',')[0]}</div><div className={styles.statLabel}>home base</div></div>
            </div>
          </div>
        </div>
      </section>

      <EditableSection
        sectionId="values"
        title="Our values"
        trackKeys={values.map(v => v.title)}
        questions={[
          { id: 'values', label: 'What are your core values or principles?', placeholder: 'e.g. Always honest with customers, never compromise on ingredients, support local suppliers', hint: 'List 3-4 things your business truly stands for.' },
          { id: 'promise', label: 'What do you promise every customer?', placeholder: 'e.g. We will always respond within the hour and never leave a job unfinished' },
        ]}
      >
        <section className={styles.values}>
          <div className={styles.inner}>
            <p className={styles.eye}>What drives us</p>
            <h2 className={styles.h2}>Our values</h2>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <div key={i} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{v.icon}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>

      <section className={styles.timeline}>
        <div className={styles.inner}>
          <p className={styles.eye}>Our journey</p>
          <h2 className={styles.h2}>How we got here</h2>
          <div className={styles.timelineList}>
            {TIMELINE.map((t, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineYear}>{t.year}</div>
                <div className={styles.timelineLine}>
                  <div className={styles.timelineDot} />
                  {i < TIMELINE.length - 1 && <div className={styles.timelineBar} />}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineLabel}>{t.label}</div>
                  <div className={styles.timelineDesc}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.inner}>
          <p className={styles.eye}>The people</p>
          <h2 className={styles.h2}>Who is behind {name}</h2>
          <div className={styles.teamGrid}>
            {['Founder & Lead', 'Operations', 'Customer Care'].map((role, i) => (
              <div key={i} className={styles.teamCard}>
                <div className={styles.teamAvatar} style={{ background: ['#eaf3de','#e6f1fb','#fbeaf0'][i] }}>👤</div>
                <div className={styles.teamName}>Team Member</div>
                <div className={styles.teamRole}>{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.inner}>
          <h2 className={styles.ctaH2}>Want to know more?</h2>
          <p className={styles.ctaDesc}>We love hearing from people. Drop us a message — no automated replies.</p>
          <Link to="/contact" className={styles.ctaBtn}>Get in touch</Link>
        </div>
      </section>
    </main>
  )
}
