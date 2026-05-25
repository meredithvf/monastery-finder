"use client";

import dynamic from "next/dynamic";
import { useGeocodedCommunities } from "@/hooks/useGeocodedCommunities";
import type { CommunityListItem } from "@/lib/types/community";
import styles from "@/components/communities/communities.module.css";

const CommunityMap = dynamic(
  () =>
    import("@/components/communities/CommunityMap").then((m) => ({
      default: m.CommunityMap,
    })),
  { ssr: false, loading: () => <p className={styles.status}>Loading map…</p> },
);

export function CommunityDetailMap({ item }: { item: CommunityListItem }) {
  const [resolved] = useGeocodedCommunities([item]);
  const hasCoords =
    resolved.latitude != null && resolved.longitude != null;

  if (!hasCoords) {
    return (
      <p className={styles.cardMeta}>
        Location coordinates are not available for this community yet.
      </p>
    );
  }

  return (
    <div className={styles.mapPreview}>
      <CommunityMap
        communities={[resolved]}
        selectedId={resolved.id}
        height={220}
        showPreview={false}
        initialZoom={9}
      />
    </div>
  );
}
