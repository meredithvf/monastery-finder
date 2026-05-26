import { NEUTRAL_SCORE } from "@/lib/matching/constants";
import type { CommunityFeatureKey } from "@/lib/matching/feature-keys";
import { SHARED_MATCHING_KEYS } from "@/lib/matching/feature-keys";
import type { UserPreferenceKey } from "@/lib/matching/feature-keys";
import type {
  NormalizedCommunityVector,
  NormalizedUserVector,
} from "@/lib/matching/normalize";

/**
 * Dimensions compared for match scoring. Keys are community feature paths;
 * user values are read from the mapped discovery profile path.
 */
export const ALIGNED_MATCHING_KEYS = [
  ...SHARED_MATCHING_KEYS,
  "community.lay_friendly_vs_monastic_oriented",
  "community.communal_living_strength",
  "practice.meditation_intensity",
  "practice.silence_level",
  "social.social_interaction_level",
  "accessibility.beginner_friendly",
  "lifestyle.daily_structure_rigidity",
  "lifestyle.spartan_vs_comfortable",
  "practice.study_vs_practice_balance",
  "community.long_term_residency_supported",
  "community.guest_stay_supported",
] as const;

export type AlignedMatchingKey = (typeof ALIGNED_MATCHING_KEYS)[number];

export type AlignmentRule = {
  key: AlignedMatchingKey;
  userKey: UserPreferenceKey;
  communityKey: CommunityFeatureKey;
  /** Flip user pole direction so it matches community semantics (0–1). */
  invertUser?: boolean;
};

export const ALIGNMENT_RULES: readonly AlignmentRule[] = [
  {
    key: "spiritual_orientation.contemplative_vs_devotional",
    userKey: "spiritual_orientation.contemplative_vs_devotional",
    communityKey: "spiritual_orientation.contemplative_vs_devotional",
  },
  {
    key: "spiritual_orientation.mystical_vs_intellectual",
    userKey: "spiritual_orientation.mystical_vs_intellectual",
    communityKey: "spiritual_orientation.mystical_vs_intellectual",
  },
  {
    key: "spiritual_orientation.traditional_vs_modern",
    userKey: "spiritual_orientation.traditional_vs_modern",
    communityKey: "spiritual_orientation.traditional_vs_modern",
  },
  {
    key: "lifestyle.urban_vs_rural",
    userKey: "lifestyle.urban_vs_rural",
    communityKey: "lifestyle.urban_vs_rural",
  },
  {
    key: "lifestyle.digital_friendly_vs_unplugged",
    userKey: "lifestyle.digital_friendly_vs_unplugged",
    communityKey: "lifestyle.digital_friendly_vs_unplugged",
  },
  {
    key: "readiness.seriousness_level",
    userKey: "readiness.seriousness_level",
    communityKey: "readiness.seriousness_level",
  },
  {
    key: "community.lay_friendly_vs_monastic_oriented",
    userKey: "community_structure.lay_friendly_vs_monastic_oriented",
    communityKey: "community.lay_friendly_vs_monastic_oriented",
  },
  {
    key: "community.communal_living_strength",
    userKey: "community_structure.communal_vs_private",
    communityKey: "community.communal_living_strength",
    invertUser: true,
  },
  {
    key: "practice.meditation_intensity",
    userKey: "spiritual_orientation.ritual_heavy_vs_meditation_heavy",
    communityKey: "practice.meditation_intensity",
  },
  {
    key: "practice.silence_level",
    userKey: "community_structure.silent_vs_social",
    communityKey: "practice.silence_level",
    invertUser: true,
  },
  {
    key: "social.social_interaction_level",
    userKey: "community_structure.silent_vs_social",
    communityKey: "social.social_interaction_level",
  },
  {
    key: "accessibility.beginner_friendly",
    userKey: "lifestyle.physically_demanding_vs_accessible",
    communityKey: "accessibility.beginner_friendly",
  },
  {
    key: "lifestyle.daily_structure_rigidity",
    userKey: "lifestyle.strict_schedules_vs_flexible",
    communityKey: "lifestyle.daily_structure_rigidity",
    invertUser: true,
  },
  {
    key: "lifestyle.spartan_vs_comfortable",
    userKey: "spiritual_orientation.ascetic_vs_balanced",
    communityKey: "lifestyle.spartan_vs_comfortable",
  },
  {
    key: "practice.study_vs_practice_balance",
    userKey: "spiritual_orientation.structured_vs_experiential",
    communityKey: "practice.study_vs_practice_balance",
  },
  {
    key: "community.long_term_residency_supported",
    userKey: "community_structure.long_term_vs_retreat_based",
    communityKey: "community.long_term_residency_supported",
    invertUser: true,
  },
  {
    key: "community.guest_stay_supported",
    userKey: "community_structure.long_term_vs_retreat_based",
    communityKey: "community.guest_stay_supported",
  },
];

export type AlignedVector = Record<AlignedMatchingKey, number>;

function applyInvert(value: number, invert?: boolean): number {
  return invert ? 1 - value : value;
}

export function toAlignedUserVector(
  user: NormalizedUserVector,
): AlignedVector {
  const out = {} as AlignedVector;
  for (const rule of ALIGNMENT_RULES) {
    const raw = user[rule.userKey] ?? NEUTRAL_SCORE;
    out[rule.key] = applyInvert(raw, rule.invertUser);
  }
  return out;
}

export function toAlignedCommunityVector(
  community: NormalizedCommunityVector,
): AlignedVector {
  const out = {} as AlignedVector;
  for (const rule of ALIGNMENT_RULES) {
    out[rule.key] = community[rule.communityKey] ?? NEUTRAL_SCORE;
  }
  return out;
}

/**
 * Cosine similarity on aligned dimensions, in [0, 1].
 * Returns 0.5 when either vector has zero magnitude (all neutral).
 */
export function cosineSimilarity(
  a: AlignedVector,
  b: AlignedVector,
  keys: readonly AlignedMatchingKey[] = ALIGNED_MATCHING_KEYS,
): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of keys) {
    const va = a[key];
    const vb = b[key];
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }

  if (magA === 0 || magB === 0) return NEUTRAL_SCORE;

  const cos = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  return Math.max(0, Math.min(1, (cos + 1) / 2));
}

export function computeMatchScore(
  user: NormalizedUserVector,
  community: NormalizedCommunityVector,
): number {
  return cosineSimilarity(
    toAlignedUserVector(user),
    toAlignedCommunityVector(community),
  );
}
