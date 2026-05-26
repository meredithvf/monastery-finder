import { getOverallScore } from "@/lib/feature-scores";
import { haversineKm } from "@/lib/community-transforms";
import type { CommunityListItem, CommunitySort } from "@/lib/types/community";

export function sortCommunities(
  items: CommunityListItem[],
  sort: CommunitySort,
  userCoords?: { latitude: number; longitude: number } | null,
): CommunityListItem[] {
  const sorted = [...items];
  if (sort === "score") {
    sorted.sort(
      (a, b) => (getOverallScore(b) ?? 0) - (getOverallScore(a) ?? 0),
    );
  } else if (sort === "beginner_friendly") {
    sorted.sort(
      (a, b) =>
        (b.beginnerFriendlyScore ?? 0) - (a.beginnerFriendlyScore ?? 0),
    );
  } else if (sort === "distance" && userCoords) {
    sorted.sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? haversineKm(
              userCoords.latitude,
              userCoords.longitude,
              a.latitude,
              a.longitude,
            )
          : Infinity;
      const db =
        b.latitude != null && b.longitude != null
          ? haversineKm(
              userCoords.latitude,
              userCoords.longitude,
              b.latitude,
              b.longitude,
            )
          : Infinity;
      return da - db;
    });
  }
  return sorted;
}
