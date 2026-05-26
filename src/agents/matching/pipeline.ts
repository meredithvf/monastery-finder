import type { SupabaseClient } from "@supabase/supabase-js";
import {
  extractHardConstraints,
  rankCommunities,
} from "@/agents/matching/matcher";
import type {
  MatchingPipelineInput,
  MatchingPipelineResult,
} from "@/agents/matching/types";
import { fetchCommunityMatchCandidates } from "@/lib/communities";
const DEFAULT_TOP_N = 10;

/**
 * End-to-end matching pipeline:
 * 1. User discovery profile → normalized user vector
 * 2. Fetch communities + feature scores from Supabase
 * 3. Normalize community vectors (inside rankCommunities)
 * 4. Apply hard constraints + weighted distance scoring
 * 5. Sort by score
 * 6. Attach explanations for the top N results
 */
export async function runMatchingPipeline(
  supabase: SupabaseClient,
  input: MatchingPipelineInput,
): Promise<MatchingPipelineResult> {
  const topN = input.topN ?? DEFAULT_TOP_N;
  const constraints = extractHardConstraints(input.userProfile);
  const candidates = await fetchCommunityMatchCandidates(supabase);
  const ranked = rankCommunities(input.userProfile, candidates, { constraints });

  return {
    ranked: ranked.slice(0, topN),
    totalCandidates: candidates.length,
    totalAfterConstraints: ranked.length,
  };
}
