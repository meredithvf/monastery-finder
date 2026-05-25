"use client";

import Link from "next/link";
import { formatLocation } from "@/lib/communities";
import type { CommunityListItem } from "@/lib/types/community";
import { ScoreSummary } from "./ScoreSummary";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

type Props = {
  item: CommunityListItem;
  onClose?: () => void;
  compact?: boolean;
};

export function CommunityPreviewCard({ item, onClose, compact }: Props) {
  return (
    <div className={compact ? undefined : styles.previewCard}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <div>
          <p className={styles.cardMeta}>{item.tradition}</p>
          <h3>{item.name}</h3>
          <p className={styles.cardMeta}>
            {formatLocation({
              city: item.city,
              state: item.state,
              country: item.country,
            })}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            className={btnStyles.btnGhost}
            onClick={onClose}
            aria-label="Close preview"
          >
            Close
          </button>
        )}
      </div>
      {item.shortDescription && (
        <p>{item.shortDescription.slice(0, compact ? 120 : 200)}</p>
      )}
      <ScoreSummary item={item} />
      <Link href={`/community/${item.id}`} className={btnStyles.btn}>
        View full profile
      </Link>
    </div>
  );
}
