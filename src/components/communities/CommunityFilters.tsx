"use client";

import type { CommunityFilters as Filters } from "@/lib/types/community";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

type Props = {
  filters: Filters;
  traditions: string[];
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset?: () => void;
};

export function CommunityFiltersBar({
  filters,
  traditions,
  onChange,
  onReset,
}: Props) {
  const pillFilters = [
    { tag: "retreat", label: "Retreats" },
    { tag: "residential", label: "Residential stays" },
    { tag: "volunteer", label: "Volunteer / work exchange" },
  ] as const;

  const tags = filters.tags ?? [];

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    onChange("tags", next as Filters["tags"]);
  };

  return (
    <div className={styles.filters}>
      <label className={styles.field}>
        Tradition
        <select
          value={filters.tradition ?? ""}
          onChange={(e) =>
            onChange("tradition", e.target.value || undefined)
          }
        >
          <option value="">All traditions</option>
          {traditions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.pillRow} aria-label="Additional filters">
        {pillFilters.map((pill) => {
          const active = tags.includes(pill.tag);
          return (
            <button
              key={pill.tag}
              type="button"
              className={`${styles.filterPill} ${
                active ? styles.filterPillActive : ""
              }`}
              onClick={() => toggleTag(pill.tag)}
              aria-pressed={active}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {onReset && (
        <button type="button" className={btnStyles.btnGhost} onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}
