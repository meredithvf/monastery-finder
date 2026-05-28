"use client";

import styles from "./communities.module.css";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function CommunitySearch({ search, onSearchChange }: Props) {
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
      </div>
    </div>
  );
}
