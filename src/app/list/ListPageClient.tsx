"use client";

import { CommunityCard } from "@/components/communities/CommunityCard";
import { CommunityFiltersBar } from "@/components/communities/CommunityFilters";
import { SearchAndSort } from "@/components/communities/SearchAndSort";
import { SiteNav } from "@/components/communities/SiteNav";
import styles from "@/components/communities/communities.module.css";
import { useCommunities, useGeolocation } from "@/hooks/useCommunities";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";

export default function ListPageClient() {
  const { filters, updateFilter, resetFilters, sort, setSort } =
    useCommunityFilters();
  const { coords, enabled, request, error: geoError } = useGeolocation();
  const { filtered, traditions, loading, error } = useCommunities({
    filters,
    sort: enabled && sort === "distance" ? "distance" : sort,
    userCoords: coords,
  });

  return (
    <div className={styles.shell}>
      <SiteNav />
      <header className={styles.pageHeader}>
        <h1>List</h1>
        <p>
          Search and sort enriched community profiles — highest match, beginner
          friendliness, or distance when location is enabled.
        </p>
      </header>

      <SearchAndSort
        search={filters.search ?? ""}
        onSearchChange={(v) => updateFilter("search", v)}
        sort={sort}
        onSortChange={setSort}
        showDistanceSort
        onRequestLocation={request}
        locationEnabled={enabled}
      />

      <div className={styles.toolbar}>
        <CommunityFiltersBar
          filters={filters}
          traditions={traditions}
          onChange={updateFilter}
          onReset={resetFilters}
        />
        {geoError && <p className={styles.error}>{geoError}</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && (
          <p className={styles.cardMeta}>
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className={styles.listLayout}>
        {loading && <p className={styles.status}>Loading communities…</p>}
        {!loading && filtered.length === 0 && (
          <p className={styles.status}>No communities match your filters.</p>
        )}
        <div className={styles.cardGrid}>
          {filtered.map((item) => (
            <CommunityCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
