"use client";

import type { CommunityFilters as Filters } from "@/lib/types/community";
import styles from "./communities.module.css";

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

      <label className={styles.field}>
        Beginner friendly
        <select
          value={filters.beginnerFriendly ?? "any"}
          onChange={(e) =>
            onChange(
              "beginnerFriendly",
              e.target.value as Filters["beginnerFriendly"],
            )
          }
        >
          <option value="any">Any</option>
          <option value="yes">Yes</option>
          <option value="mixed">Mixed</option>
          <option value="no">No</option>
        </select>
      </label>

      <label className={styles.field}>
        Cost
        <select
          value={filters.costRange ?? "any"}
          onChange={(e) =>
            onChange("costRange", e.target.value as Filters["costRange"])
          }
        >
          <option value="any">Any</option>
          <option value="free">Free / donation</option>
          <option value="low">Low</option>
          <option value="mid">Moderate</option>
          <option value="high">Higher cost</option>
        </select>
      </label>

      <label className={styles.field}>
        Setting
        <select
          value={filters.setting ?? "any"}
          onChange={(e) =>
            onChange("setting", e.target.value as Filters["setting"])
          }
        >
          <option value="any">Any</option>
          <option value="rural">Rural</option>
          <option value="suburban">Suburban</option>
          <option value="urban">Urban</option>
        </select>
      </label>

      {onReset && (
        <button type="button" className={styles.btnGhost} onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}
