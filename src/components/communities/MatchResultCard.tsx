import Link from "next/link";
import { formatLocation } from "@/lib/communities";
import type { EnrichedRankedMatch } from "@/lib/discovery-match";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

export function MatchResultCard({
  match,
  compact = false,
  selected = false,
  onSelect,
}: {
  match: EnrichedRankedMatch;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const item = match.community;
  const pct = Math.round(match.score * 100);

  const body = (
    <>
      <div className={styles.scoreRow}>
        <span className={styles.matchBadge}>{pct}% fit</span>
        {item && (
          <span className={styles.scoreBadge}>{item.tradition}</span>
        )}
      </div>
      <h3 className={styles.matchTitle}>
        {item ? (
          <Link href={`/community/${item.id}`}>{match.name}</Link>
        ) : (
          match.name
        )}
      </h3>
      {item && (
        <p className={styles.cardMeta}>
          {formatLocation({
            city: item.city,
            state: item.state,
            country: item.country,
          })}
        </p>
      )}
      <p className={compact ? styles.matchExplanationCompact : styles.matchExplanation}>
        {match.explanation}
      </p>
      {!compact && item?.shortDescription && (
        <p className={styles.cardMeta}>{item.shortDescription}</p>
      )}
      {item && !compact && (
        <Link href={`/community/${item.id}`} className={btnStyles.btn}>
          View profile
        </Link>
      )}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`${styles.matchCard} ${styles.matchCardButton} ${selected ? styles.matchCardSelected : ""}`}
        onClick={onSelect}
      >
        {body}
      </button>
    );
  }

  return (
    <article
      className={`${styles.matchCard} ${selected ? styles.matchCardSelected : ""}`}
    >
      {body}
    </article>
  );
}
