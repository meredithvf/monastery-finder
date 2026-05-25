import Link from "next/link";
import { formatLocation } from "@/lib/communities";
import type { CommunityListItem } from "@/lib/types/community";
import { ScoreSummary } from "./ScoreSummary";
import styles from "./communities.module.css";
import btnStyles from "@/styles/buttons.module.css";

export function CommunityCard({ item }: { item: CommunityListItem }) {
  return (
    <article className={styles.card}>
      <p className={styles.cardMeta}>{item.tradition}</p>
      <h3>
        <Link href={`/community/${item.id}`}>{item.name}</Link>
      </h3>
      <p className={styles.cardMeta}>
        {formatLocation({
          city: item.city,
          state: item.state,
          country: item.country,
        })}
      </p>
      {item.shortDescription && <p>{item.shortDescription}</p>}
      <ScoreSummary item={item} />
      {item.tags.length > 0 && (
        <div className={styles.cardTags}>
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <Link href={`/community/${item.id}`} className={btnStyles.btn}>
        View profile
      </Link>
    </article>
  );
}
