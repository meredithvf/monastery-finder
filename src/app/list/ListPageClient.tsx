"use client";

import { CommunityCard } from "@/components/communities/CommunityCard";
import { CommunityFiltersBar } from "@/components/communities/CommunityFilters";
import { CommunitySearch } from "@/components/communities/CommunitySearch";
import { SiteNav } from "@/components/communities/SiteNav";
import styles from "@/components/communities/communities.module.css";
import { useCommunities } from "@/hooks/useCommunities";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";

export default function ListPageClient() {
  const { filters, updateFilter, resetFilters } = useCommunityFilters();
  const {
    filtered,
    traditions,
    communityTypes,
    states,
    loading,
    error,
  } = useCommunities({ filters });

  return (
    <div className={styles.shell}>
      <SiteNav />
      <header className={styles.pageHeader}>
        <h1>List</h1>
        <p>Search and browse enriched community profiles.</p>
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
