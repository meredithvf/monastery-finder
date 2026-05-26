import type { AlignedMatchingKey } from "@/lib/matching/alignment";
import type { NormalizedCommunityVector } from "@/lib/matching/normalize";
import type {
  CommunityFeatureScores,
  LegacyFeatureScores,
} from "@/lib/types/community";

/** Hard filters applied before vector scoring. */
export type MatchHardConstraints = {
  region?: string;
  tradition?: string;
};

export type CommunityMatchInput = {
  id: string;
  name: string;
  tradition: string;
  region?: string | null;
  /** Raw feature scores or a pre-normalized community vector. */
  features:
    | NormalizedCommunityVector
    | CommunityFeatureScores
    | LegacyFeatureScores
    | null
    | undefined;
};

export type RankedCommunityMatch = {
  id: string;
  name: string;
  tradition: string;
  region: string | null;
  score: number;
  explanation: string;
  /** Aligned dimensions with the strongest fit (smallest distance). */
  highlights: string[];
};

export type RankCommunitiesOptions = {
  constraints?: MatchHardConstraints;
  weights?: Partial<Record<AlignedMatchingKey, number>>;
};
