import {
  DiscoveryChatSection,
  DiscoveryProfileSection,
  DiscoveryProvider,
} from "@/components/DiscoveryChat";
import { HomeMapSection } from "@/components/communities/HomeMapSection";
import styles from "./page.module.css";
import btnStyles from "@/styles/buttons.module.css";

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
    <DiscoveryProvider>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroMedia} />
          <div className={styles.overlay} />
          <nav className={styles.nav}>
            <p className={styles.brand}>Monastery Finder</p>
            <div className={styles.navLinks}>
              <a href="/map">Map</a>
              <a href="/list">List</a>
            </div>
          </nav>

          <div className={styles.heroContent}>
            <h1>Monasteries. Convents. Temples.</h1>
            <p className={styles.subtitle}>
              Maybe you are looking to deepend your spirituality. Maybe you are
              looking for religion. Maybe you just need a break from work. Find
              where you need to be.
            </p>
          </div>
        </header>

        <section className={styles.discoveryBelowFold} aria-label="Discovery">
          <DiscoveryChatSection />
          <DiscoveryProfileSection />
        </section>

        <HomeMapSection />
      </div>
    </DiscoveryProvider>
  );
}
