import type { RankedCommunityMatch } from "@/lib/matching/candidates";
import type { CommunityListItem } from "@/lib/types/community";

export type EnrichedRankedMatch = RankedCommunityMatch & {
  community: CommunityListItem | null;
};

export type DiscoveryMatchResponse = {
  ranked: EnrichedRankedMatch[];
  totalCandidates: number;
  totalAfterConstraints: number;
};
