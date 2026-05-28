"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CommunityFiltersBar } from "@/components/communities/CommunityFilters";
import { CommunitySearch } from "@/components/communities/CommunitySearch";
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
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const scrollListToSelection = useRef(false);

  useEffect(() => {
    if (selectedId && !usFiltered.some((c) => c.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, usFiltered]);

  useEffect(() => {
    if (!selectedId || !scrollListToSelection.current) return;
    scrollListToSelection.current = false;

    const row = rowRefs.current.get(selectedId);
    if (!row) return;

    const scrollToRow = () => {
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    // Wait for the row to expand before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToRow);
    });
  }, [selectedId]);

  const selectFromMap = (id: string | null) => {
    scrollListToSelection.current = id != null;
    setSelectedId(id);
  };

  return (
    <div className={`${styles.shell} ${styles.mapPageShell}`}>
      <SiteNav />
      <header className={styles.pageHeader}>
        <h1>Map</h1>
      </header>

      <CommunitySearch
        search={filters.search ?? ""}
        onSearchChange={(v) => updateFilter("search", v)}
      />

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
            onSelect={selectFromMap}
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
                  <CommunityPreviewCard
                    key={item.id}
                    item={item}
                    mapListRow
                    expanded={isSelected}
                    listRowRef={(el) => {
                      if (el) rowRefs.current.set(item.id, el);
                      else rowRefs.current.delete(item.id);
                    }}
                    onToggle={() =>
                      setSelectedId(isSelected ? null : item.id)
                    }
                    onClose={() => setSelectedId(null)}
                  />
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
