import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import type { RankedCommunityMatch } from "@/lib/matching/candidates";

export type {
  CommunityMatchInput,
  MatchHardConstraints,
  RankCommunitiesOptions,
  RankedCommunityMatch,
} from "@/lib/matching/candidates";

export type MatchingPipelineInput = {
  userProfile: UserDiscoveryProfile;
  topN?: number;
};

export type MatchingPipelineResult = {
  ranked: RankedCommunityMatch[];
  totalCandidates: number;
  totalAfterConstraints: number;
};
