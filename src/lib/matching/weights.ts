import type { AlignedMatchingKey } from "@/lib/matching/alignment";
import { ALIGNED_MATCHING_KEYS } from "@/lib/matching/alignment";

/** Default per-dimension weights for weighted distance scoring. */
export const DEFAULT_MATCH_WEIGHTS = Object.fromEntries(
  ALIGNED_MATCHING_KEYS.map((key) => [key, 1]),
) as Record<AlignedMatchingKey, number>;
