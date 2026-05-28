"use client";

import Link from "next/link";
import type { Ref } from "react";
import { formatLocation } from "@/lib/communities";
import type { CommunityListItem } from "@/lib/types/community";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

type Props = {
  item: CommunityListItem;
  onClose?: () => void;
  /** Short text for overlay previews on the map canvas. */
  compact?: boolean;
  /** Expanded card inside the map page sidebar list. */
  embedded?: boolean;
  /** Expandable row in the map page sidebar — collapsed shows tradition + name. */
  mapListRow?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  listRowRef?: Ref<HTMLDivElement>;
};

export function CommunityPreviewCard({
  item,
  onClose,
  compact,
  embedded,
  mapListRow,
  expanded,
  onToggle,
  listRowRef,
}: Props) {
  if (mapListRow) {
    return (
      <div
        ref={listRowRef}
        className={`${styles.sidebarPreviewCard} ${styles.mapListRow}`}
        data-expanded={expanded ? "true" : "false"}
      >
        {expanded && onClose && (
          <button
            type="button"
            className={styles.previewCardClose}
            onClick={onClose}
            aria-label="Collapse preview"
          >
            ×
          </button>
        )}
        <button
          type="button"
          className={styles.mapListRowToggle}
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className={styles.previewCardHeader}>
            <div>
              <p className={styles.cardMeta}>{item.tradition}</p>
              <h3 className={styles.previewCardTitle}>{item.name}</h3>
              <p className={`${styles.cardMeta} ${styles.mapListRowMore}`}>
                {formatLocation({
                  city: item.city,
                  state: item.state,
                  country: item.country,
                })}
              </p>
            </div>
          </div>
        </button>
        {item.shortDescription && (
          <p className={`${styles.previewDescription} ${styles.mapListRowMore}`}>
            {item.shortDescription}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className={`${styles.cardTags} ${styles.mapListRowMore}`}>
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <Link
          href={`/community/${item.id}`}
          className={`${btnStyles.btn} ${styles.mapListRowMore}`}
        >
          View full profile
        </Link>
      </div>
    );
  }

  const rootClass = embedded
    ? styles.sidebarPreviewCard
    : compact
      ? undefined
      : styles.previewCard;

  const descriptionLimit = compact ? 120 : embedded ? undefined : 200;

  return (
    <div className={rootClass || undefined}>
      {onClose && (
        <button
          type="button"
          className={styles.previewCardClose}
          onClick={onClose}
          aria-label="Collapse preview"
        >
          ×
        </button>
      )}
      <div className={styles.previewCardHeader}>
        <div>
          <p className={styles.cardMeta}>{item.tradition}</p>
          <h3 className={embedded ? styles.previewCardTitle : undefined}>
            {item.name}
          </h3>
          <p className={styles.cardMeta}>
            {formatLocation({
              city: item.city,
              state: item.state,
              country: item.country,
            })}
          </p>
        </div>
      </div>
      {item.shortDescription && (
        <p className={embedded ? styles.previewDescription : undefined}>
          {descriptionLimit != null
            ? item.shortDescription.slice(0, descriptionLimit)
            : item.shortDescription}
        </p>
      )}
      {embedded && item.tags.length > 0 && (
        <div className={styles.cardTags}>
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <Link href={`/community/${item.id}`} className={btnStyles.btn}>
        View full profile
      </Link>
    </div>
  );
}
