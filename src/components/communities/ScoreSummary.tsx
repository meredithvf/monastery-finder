import type { CommunityListItem } from "@/lib/types/community";
import styles from "./communities.module.css";

export function ScoreSummary({ item }: { item: CommunityListItem }) {
  const overall = item.adjustedOverall ?? item.compositeScore;
  const beginner = item.beginnerFriendlyScore;
  const cost = item.costAffordability;

  if (overall == null && beginner == null && cost == null) {
    return <p className={styles.cardMeta}>Scores pending enrichment</p>;
  }

  return (
    <div className={styles.scoreRow}>
      {overall != null && (
        <span className={styles.scoreBadge}>
          Match {Math.round(overall * 100)}%
        </span>
      )}
      {beginner != null && (
        <span className={styles.scoreBadge}>
          Beginner {Math.round(beginner * 100)}%
        </span>
      )}
      {cost != null && (
        <span className={styles.scoreBadge}>
          Affordable {Math.round(cost * 100)}%
        </span>
      )}
    </div>
  );
}
