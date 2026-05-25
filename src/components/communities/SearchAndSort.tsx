"use client";

import type { CommunitySort } from "@/lib/types/community";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: CommunitySort;
  onSortChange: (value: CommunitySort) => void;
  showDistanceSort?: boolean;
  onRequestLocation?: () => void;
  locationEnabled?: boolean;
};

export function SearchAndSort({
  search,
  onSearchChange,
  sort,
  onSortChange,
  showDistanceSort,
  onRequestLocation,
  locationEnabled,
}: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchRow}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by name, place, tradition, or tag…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search communities"
        />
        {showDistanceSort && onRequestLocation && !locationEnabled && (
          <button type="button" className={btnStyles.btnGhost} onClick={onRequestLocation}>
            Use location
          </button>
        )}
      </div>

      <label className={styles.field}>
        Sort by
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CommunitySort)}
        >
          <option value="score">Highest score</option>
          <option value="beginner_friendly">Most beginner friendly</option>
          {showDistanceSort && locationEnabled && (
            <option value="distance">Closest to you</option>
          )}
        </select>
      </label>
    </div>
  );
}
