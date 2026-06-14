import Link from "next/link";
import { sitePath } from "../../lib/site";
import { values } from "./content";
import styles from "./AboutPage.module.css";

const TIMELINE = [
  ["2019", "Founded", "Started with one idea and a lot of determination."],
  ["2021", "Grew the team", "Demand grew, so did we. Added our first staff members."],
  ["2023", "Expanded range", "Launched new products and services based on customer feedback."],
  ["2025", "Online and growing", "Now reaching customers across the region and beyond."]
];

export default function AboutPage({ slug, content }) {
  const valueItems = values(content);
  const homeBase = String(content.location || "Local Area").split(",")[0];

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div className={styles.inner}>
          <p className={styles.eye}>Our story</p>
          <h1 className={styles.h1}>About {content.name}</h1>
          <p className={styles.sub}>{content.about || content.desc}</p>
        </div>
      </section>
      <section className={styles.mission}>
        <div className={styles.inner}>
          <div className={styles.missionGrid}>
            <div className={styles.missionText}>
              <p className={styles.eye}>Our mission</p>
              <h2 className={styles.h2}>Why we do what we do</h2>
              <p className={styles.body}>{content.name} was built on a simple belief: that {homeBase} deserves access to quality {String(content.tag || "business").toLowerCase()} without compromising on price, service, or convenience.</p>
              <p className={styles.body}>We started small, with a skill and a commitment to doing it well. Today we serve {content.volume || "50"}+ customers every week, but that original commitment has not changed.</p>
              <Link href={sitePath(slug, "contact")} className={styles.missionCta}>Work with us →</Link>
            </div>
            <div className={styles.missionStats}>
              <StatCard value={`${content.volume || "50"}+`} label={content.unit || "customers served"} />
              <StatCard value="5★" label="avg rating" />
              <StatCard value="100%" label="satisfaction" />
              <StatCard value={homeBase} label="home base" />
            </div>
          </div>
        </div>
      </section>
      <section className={styles.values}>
        <div className={styles.inner}>
          <p className={styles.eye}>What drives us</p>
          <h2 className={styles.h2}>Our values</h2>
          <div className={styles.valuesGrid}>
            {valueItems.map((value) => (
              <article key={value.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueBody}>{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.timeline}>
        <div className={styles.inner}>
          <p className={styles.eye}>Our journey</p>
          <h2 className={styles.h2}>How we got here</h2>
          <div className={styles.timelineList}>
            {TIMELINE.map(([year, label, description], index) => (
              <div key={year} className={styles.timelineItem}>
                <div className={styles.timelineYear}>{year}</div>
                <div className={styles.timelineLine}>
                  <div className={styles.timelineDot} />
                  {index < TIMELINE.length - 1 && <div className={styles.timelineBar} />}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineLabel}>{label}</div>
                  <div className={styles.timelineDesc}>{description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.cta}>
        <div className={styles.inner}>
          <h2 className={styles.ctaH2}>Want to know more?</h2>
          <p className={styles.ctaDesc}>We love hearing from people. Get in touch using the details on our contact page.</p>
          <Link href={sitePath(slug, "contact")} className={styles.ctaBtn}>Get in touch</Link>
        </div>
      </section>
    </main>
  );
}

function StatCard({ value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statNum}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
