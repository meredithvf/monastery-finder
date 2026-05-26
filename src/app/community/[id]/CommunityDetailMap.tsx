"use client";

import { CommunityMapLazy } from "@/components/communities/CommunityMapLazy";
import { useGeocodedCommunities } from "@/hooks/useGeocodedCommunities";
import type { CommunityListItem } from "@/lib/types/community";
import styles from "@/components/communities/communities.module.css";

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
      <CommunityMapLazy
        communities={[resolved]}
        selectedId={resolved.id}
        height={220}
        showPreview={false}
        initialZoom={9}
      />
    </div>
  );
}
