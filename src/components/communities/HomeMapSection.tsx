"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommunities } from "@/hooks/useCommunities";
import styles from "./communities.module.css";
import pageStyles from "@/app/page.module.css";

const CommunityMap = dynamic(
  () =>
    import("./CommunityMap").then((m) => ({ default: m.CommunityMap })),
  {
    ssr: false,
    loading: () => <p className={styles.status}>Loading map…</p>,
  },
);

export function HomeMapSection() {
  const { mappable, loading, error } = useCommunities();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const preview = useMemo(
    () => mappable.find((c) => c.id === selectedId) ?? null,
    [mappable, selectedId],
  );

  return (
    <section className={styles.homeMapSection} aria-label="Explore on map">
      <div className={pageStyles.sectionHeading}>
        <p className={pageStyles.sectionLabel}>Explore communities</p>
        <h2>See contemplative places across the map.</h2>
        <p>
          Browse enriched monastery and retreat profiles from our research
          pipeline — filter by tradition, setting, and practical fit.
        </p>
      </div>

      <div className={styles.homeMapFrame}>
        {loading && <p className={styles.status}>Loading communities…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <CommunityMap
            communities={mappable}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height={360}
            initialZoom={3.2}
          />
        )}
      </div>

      {preview && (
        <div style={{ maxWidth: 480 }}>
          <p className={styles.cardMeta}>
            {preview.tradition} · {preview.city}, {preview.state}
          </p>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>{preview.name}</h3>
        </div>
      )}

      <div className={styles.homeMapActions}>
        <Link href="/map" className={styles.btn}>
          Open full map
        </Link>
        <Link href="/list" className={styles.btnGhost}>
          Browse list
        </Link>
      </div>
    </section>
  );
}
