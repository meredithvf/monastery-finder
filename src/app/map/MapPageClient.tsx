"use client";

import { useMemo, useState } from "react";
import { CommunityFiltersBar } from "@/components/communities/CommunityFilters";
import { CommunityMapLazy } from "@/components/communities/CommunityMapLazy";
import { CommunityPreviewCard } from "@/components/communities/CommunityPreviewCard";
import { SiteNav } from "@/components/communities/SiteNav";
import styles from "@/components/communities/communities.module.css";
import { useCommunities } from "@/hooks/useCommunities";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";
import { isUSCommunity } from "@/lib/usMap";

export default function MapPageClient() {
  const { filters, updateFilter, resetFilters } = useCommunityFilters();
  const {
    filtered,
    mappable,
    traditions,
    communityTypes,
    states,
    loading,
    error,
  } = useCommunities({
    filters,
  });
  const usFiltered = useMemo(() => filtered.filter(isUSCommunity), [filtered]);
  const usMappable = useMemo(() => mappable.filter(isUSCommunity), [mappable]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = usFiltered.find((c) => c.id === selectedId) ?? null;

  return (
    <div className={`${styles.shell} ${styles.mapPageShell}`}>
      <SiteNav />
      <header className={styles.pageHeader}>
        <h1>Map</h1>
      </header>

      <div className={styles.toolbar}>
        <CommunityFiltersBar
          filters={filters}
          traditions={traditions}
          communityTypes={communityTypes}
          states={states}
          onChange={updateFilter}
          onReset={resetFilters}
        />
        {error && <p className={styles.error}>{error}</p>}
        {!loading && (
          <p className={styles.cardMeta}>
            {usFiltered.length} communit{usFiltered.length === 1 ? "y" : "ies"}
          </p>
        )}
      </div>

      <div className={`${styles.mapLayout} ${styles.mapPageLayout}`}>
        {loading ? (
          <p className={styles.status}>Loading communities…</p>
        ) : (
          <CommunityMapLazy
            communities={usMappable}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height="100%"
            showPreview={false}
            restrictToUS
          />
        )}
        <aside className={styles.sidebar} aria-label="Community list">
          {loading ? (
            <p className={styles.status}>Loading…</p>
          ) : usFiltered.length === 0 ? (
            <p className={styles.cardMeta}>
              No communities match your filters.
            </p>
          ) : (
            <div className={styles.mapSidebarList}>
              {usFiltered.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <div key={item.id} className={styles.mapListRow}>
                    <button
                      type="button"
                      className={`${styles.mapListButton} ${
                        isSelected ? styles.mapListButtonSelected : ""
                      }`}
                      onClick={() => setSelectedId(item.id)}
                      aria-expanded={isSelected}
                    >
                      {item.name}
                    </button>
                    {isSelected && selected && (
                      <div className={styles.mapInlinePreview}>
                        <CommunityPreviewCard
                          item={selected}
                          embedded
                          onClose={() => setSelectedId(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
