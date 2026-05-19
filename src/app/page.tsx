import styles from "./page.module.css";

const featuredMonasteries = [
  {
    name: "Abbey of Sainte-Marie",
    location: "Provence, France",
    tradition: "Benedictine",
    environment: "Lavender fields, stone cloisters, and morning liturgy.",
  },
  {
    name: "Monasterio de San Salvador",
    location: "Galicia, Spain",
    tradition: "Cistercian",
    environment: "Forest hills, pilgrimage trails, and simple guest rooms.",
  },
  {
    name: "St. Theophan Monastery",
    location: "Meteora, Greece",
    tradition: "Orthodox",
    environment: "Mountain overlooks, candlelit chapel, and guided silence.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroMedia} />
        <div className={styles.overlay} />
        <nav className={styles.nav}>
          <p className={styles.brand}>Monastery Finder</p>
          <div className={styles.navLinks}>
            <a href="#">Discover</a>
            <a href="#">Retreat Types</a>
            <a href="#">Resources</a>
          </div>
        </nav>

        <div className={styles.heroContent}>
          <h1>Monasteries. Convents. Temples.</h1>
          <p className={styles.subtitle}>
            Take a weekend christian retreat, or live a year at a buddhist
            monastery. Find the place where your sould needs to go.
          </p>

          <form className={styles.searchPanel}>
            <label className={styles.field}>
              Retreat focus
              <input
                type="text"
                placeholder="Silence, liturgy, study, hiking..."
              />
            </label>
            <label className={styles.field}>
              Region
              <select defaultValue="">
                <option value="" disabled>
                  Choose a region
                </option>
                <option>Europe</option>
                <option>North America</option>
                <option>South America</option>
                <option>Asia</option>
              </select>
            </label>
            <button type="button">Start Exploring</button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Featured stays</p>
            <h2>
              Monasteries selected for peaceful settings and welcoming hosts.
            </h2>
            <p>
              A curated shortlist inspired by seasonal weather, accessibility,
              and contemplative rhythm.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {featuredMonasteries.map((monastery) => (
              <article key={monastery.name} className={styles.card}>
                <p className={styles.cardTradition}>{monastery.tradition}</p>
                <h3>{monastery.name}</h3>
                <p className={styles.cardLocation}>{monastery.location}</p>
                <p>{monastery.environment}</p>
                <button type="button">View retreat</button>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.secondarySection}`}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Browse by atmosphere</p>
            <h2>Choose the feeling you want to travel into.</h2>
          </div>
          <div className={styles.chips}>
            <span>Mountain quiet</span>
            <span>Coastal breeze</span>
            <span>Forest solitude</span>
            <span>Ancient architecture</span>
            <span>Liturgical music</span>
            <span>Pilgrimage routes</span>
          </div>
        </section>
      </main>
    </div>
  );
}
