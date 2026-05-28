"use client";

import { formatCommunityType } from "@/lib/community-labels";
import type { CommunityFilters as Filters } from "@/lib/types/community";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

type Props = {
  filters: Filters;
  traditions: string[];
  communityTypes: string[];
  states: string[];
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset?: () => void;
};

export function CommunityFiltersBar({
  filters,
  traditions,
  communityTypes,
  states,
  onChange,
  onReset,
}: Props) {
  const tagPills = [
    { tag: "retreat", label: "Retreats" },
    { tag: "residential", label: "Residential stays" },
    { tag: "volunteer", label: "Volunteer / work exchange" },
  ] as const;

  const featurePills = [
    {
      key: "silent" as const,
      label: "Silent",
      active: Boolean(filters.silent),
      toggle: () => onChange("silent", !filters.silent),
    },
    {
      key: "unplugged" as const,
      label: "Unplugged",
      active: Boolean(filters.unplugged),
      toggle: () => onChange("unplugged", !filters.unplugged),
    },
    {
      key: "free" as const,
      label: "Free",
      active: filters.costRange === "free",
      toggle: () =>
        onChange("costRange", filters.costRange === "free" ? "any" : "free"),
    },
    {
      key: "beginnerFriendly" as const,
      label: "Beginner friendly",
      active: filters.beginnerFriendly === "yes",
      toggle: () =>
        onChange(
          "beginnerFriendly",
          filters.beginnerFriendly === "yes" ? "any" : "yes",
        ),
    },
  ];

  const tags = filters.tags ?? [];

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    onChange("tags", next as Filters["tags"]);
  };

  const renderPill = (
    key: string,
    label: string,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      key={key}
      type="button"
      className={`${styles.filterPill} ${active ? styles.filterPillActive : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  );

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
        Type
        <select
          value={filters.type ?? ""}
          onChange={(e) => onChange("type", e.target.value || undefined)}
        >
          <option value="">All types</option>
          {communityTypes.map((type) => (
            <option key={type} value={type}>
              {formatCommunityType(type)}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        State
        <select
          value={filters.state ?? ""}
          onChange={(e) => onChange("state", e.target.value || undefined)}
        >
          <option value="">All states</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.filterChipSection}>
        <div className={styles.pillRow} aria-label="Filter chips">
          {tagPills.map((pill) =>
            renderPill(pill.tag, pill.label, tags.includes(pill.tag), () =>
              toggleTag(pill.tag),
            ),
          )}
          {featurePills.map((pill) =>
            renderPill(pill.key, pill.label, pill.active, pill.toggle),
          )}
        </div>

        {onReset && (
          <button
            type="button"
            className={btnStyles.btnTertiary}
            onClick={onReset}
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
