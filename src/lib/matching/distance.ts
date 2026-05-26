import type { AlignedMatchingKey, AlignedVector } from "@/lib/matching/alignment";
import { ALIGNED_MATCHING_KEYS } from "@/lib/matching/alignment";
import { DEFAULT_MATCH_WEIGHTS } from "@/lib/matching/weights";

/**
 * Weighted mean absolute distance on aligned [0, 1] dimensions.
 * Returns 0 when vectors are identical, 1 when maximally apart on every axis.
 */
export function weightedDistance(
  a: AlignedVector,
  b: AlignedVector,
  weights: Readonly<Partial<Record<AlignedMatchingKey, number>>> = DEFAULT_MATCH_WEIGHTS,
  keys: readonly AlignedMatchingKey[] = ALIGNED_MATCHING_KEYS,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const key of keys) {
    const w = weights[key] ?? DEFAULT_MATCH_WEIGHTS[key] ?? 1;
    if (w <= 0) continue;
    weightedSum += w * Math.abs(a[key] - b[key]);
    totalWeight += w;
  }

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

/** Match score in [0, 1]: 1 = perfect alignment, 0 = maximal distance. */
export function weightedMatchScore(
  a: AlignedVector,
  b: AlignedVector,
  weights?: Readonly<Partial<Record<AlignedMatchingKey, number>>>,
): number {
  const distance = weightedDistance(a, b, weights);
  return Math.max(0, Math.min(1, 1 - distance));
}
