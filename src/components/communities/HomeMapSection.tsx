"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CommunityMapLazy } from "@/components/communities/CommunityMapLazy";
import { useCommunities } from "@/hooks/useCommunities";
import { isUSCommunity } from "@/lib/usMap";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

export function HomeMapSection() {
  const { mappable, loading, error } = useCommunities();
  const usMappable = useMemo(() => mappable.filter(isUSCommunity), [mappable]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const preview = useMemo(
    () => usMappable.find((c) => c.id === selectedId) ?? null,
    [usMappable, selectedId],
  );

  return (
    <section className={styles.homeMapSection} aria-label="Explore on map">
      <div className={styles.sectionHeading}>
        <h2>Explore Communities</h2>
      </div>

      <div className={styles.homeMapFrame}>
        {loading && <p className={styles.status}>Loading communities…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <CommunityMapLazy
            communities={usMappable}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height={360}
            initialZoom={3.2}
            restrictToUS
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
        <Link href="/map" className={btnStyles.btn}>
          Open full map
        </Link>
        <Link href="/list" className={btnStyles.btnGhost}>
          Browse list
        </Link>
      </div>
    </section>
  );
}
