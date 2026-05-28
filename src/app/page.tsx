import {
  DiscoveryChatSection,
  DiscoveryPreferencesSection,
  DiscoveryProfileSection,
  DiscoveryProvider,
} from "@/components/DiscoveryChat";
import { HomeMapSection } from "@/components/communities/HomeMapSection";
import styles from "./page.module.css";

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
            <h1>Monasteries.</h1>
            <h1>Convents.</h1>
            <h1>Temples.</h1>
            <p className={styles.subtitle}>
              Maybe you are looking to deepen your spirituality. Maybe you are
              looking for religion. Maybe you just need a break from work. Find
              where you need to be.
            </p>
          </div>
        </header>

        <section className={styles.discoveryBelowFold} aria-label="Discovery">
          <DiscoveryChatSection />
          <DiscoveryPreferencesSection />
          <DiscoveryProfileSection />
        </section>

        <HomeMapSection />
      </div>
    </DiscoveryProvider>
  );
}
