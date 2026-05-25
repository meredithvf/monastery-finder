"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CommunityFiltersBar } from "@/components/communities/CommunityFilters";
import { CommunityPreviewCard } from "@/components/communities/CommunityPreviewCard";
import { SiteNav } from "@/components/communities/SiteNav";
import styles from "@/components/communities/communities.module.css";
import { useCommunities } from "@/hooks/useCommunities";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";

const CommunityMap = dynamic(
  () =>
    import("@/components/communities/CommunityMap").then((m) => ({
      default: m.CommunityMap,
    })),
  { ssr: false, loading: () => <p className={styles.status}>Loading map…</p> },
);

export default function MapPageClient() {
  const { filters, updateFilter, resetFilters } = useCommunityFilters();
  const { filtered, mappable, traditions, loading, error } = useCommunities({
    filters,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = filtered.find((c) => c.id === selectedId) ?? null;

  return (
    <div className={styles.shell}>
      <SiteNav />
      <header className={styles.pageHeader}>
        <h1>Map</h1>
        <p>
          Clustered markers at a distance; click a community for a quick
          preview, then open the full profile.
        </p>
      </header>

      <div className={styles.toolbar}>
        <CommunityFiltersBar
          filters={filters}
          traditions={traditions}
          onChange={updateFilter}
          onReset={resetFilters}
        />
        {error && <p className={styles.error}>{error}</p>}
        {!loading && (
          <p className={styles.cardMeta}>
            {filtered.length} communit{filtered.length === 1 ? "y" : "ies"}
          </p>
        )}
      </div>

      <div className={styles.mapLayout}>
        <div className={styles.mapPane}>
          {loading ? (
            <p className={styles.status}>Loading communities…</p>
          ) : (
            <CommunityMap
              communities={mappable}
              selectedId={selectedId}
              onSelect={setSelectedId}
              height="calc(100vh - 220px)"
              showPreview={false}
            />
          )}
        </div>
        <aside className={styles.sidebar}>
          {selected ? (
            <CommunityPreviewCard
              item={selected}
              onClose={() => setSelectedId(null)}
              compact
            />
          ) : (
            <p className={styles.cardMeta}>
              Select a marker to preview a community.
            </p>
          )}
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
            {filtered.slice(0, 12).map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.btnGhost}
                style={{ textAlign: "left" }}
                onClick={() => setSelectedId(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
