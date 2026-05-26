import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import type {
  CommunityMatchInput,
  RankedCommunityMatch,
} from "@/lib/matching/candidates";

export type {
  CommunityMatchInput,
  MatchHardConstraints,
  RankCommunitiesOptions,
  RankedCommunityMatch,
} from "@/lib/matching/candidates";

export type MatchingPipelineInput = {
  userProfile: UserDiscoveryProfile;
  topN?: number;
  /** When set, the pipeline skips its own Supabase fetch for candidates. */
  candidates?: CommunityMatchInput[];
};

export type MatchingPipelineResult = {
  ranked: RankedCommunityMatch[];
  totalCandidates: number;
  totalAfterConstraints: number;
};
