export {
  ALIGNMENT_RULES,
  ALIGNED_MATCHING_KEYS,
  computeMatchScore,
  cosineSimilarity,
  toAlignedCommunityVector,
  toAlignedUserVector,
  type AlignedMatchingKey,
  type AlignedVector,
  type AlignmentRule,
} from "@/lib/matching/alignment";
export {
  NEUTRAL_SCORE,
  READINESS_SERIOUSNESS_MAX,
  READINESS_SERIOUSNESS_MIN,
  USER_SPECTRUM_MAX,
} from "@/lib/matching/constants";
export {
  COMMUNITY_FEATURE_KEYS,
  SHARED_MATCHING_KEYS,
  USER_PREFERENCE_KEYS,
  type CommunityFeatureKey,
  type UserPreferenceKey,
} from "@/lib/matching/feature-keys";
export {
  normalizeCommunityFeatures,
  normalizeUserPreferences,
  seriousnessToUnit,
  toUnitScore,
  type NormalizedCommunityVector,
  type NormalizedUserVector,
} from "@/lib/matching/normalize";
