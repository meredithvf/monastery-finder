import type { CommunityFeatureGroups } from "@/lib/types/community";

/** Community feature paths (`group.field`) from `community_scores.feature_scores`. */
export type CommunityFeatureKey = {
  [G in keyof CommunityFeatureGroups]: `${G & string}.${keyof CommunityFeatureGroups[G] & string}`;
}[keyof CommunityFeatureGroups];

export const COMMUNITY_FEATURE_KEYS = [
  "practice.meditation_intensity",
  "practice.silence_level",
  "practice.study_vs_practice_balance",
  "community.communal_living_strength",
  "community.residential_option_available",
  "community.long_term_residency_supported",
  "community.guest_stay_supported",
  "community.lay_friendly_vs_monastic_oriented",
  "social.social_interaction_level",
  "social.community_size_estimate",
  "accessibility.beginner_friendly",
  "budget.budget",
  "budget.scholarship_available",
  "budget.volunteer_work_exchange_available",
  "lifestyle.urban_vs_rural",
  "lifestyle.spartan_vs_comfortable",
  "lifestyle.daily_structure_rigidity",
  "lifestyle.digital_friendly_vs_unplugged",
  "spiritual_orientation.contemplative_vs_devotional",
  "spiritual_orientation.mystical_vs_intellectual",
  "spiritual_orientation.traditional_vs_modern",
  "readiness.seriousness_level",
] as const satisfies readonly CommunityFeatureKey[];

/** Discovery profile spectrum paths (`group.field`). */
export const USER_PREFERENCE_KEYS = [
  "spiritual_orientation.contemplative_vs_devotional",
  "spiritual_orientation.mystical_vs_intellectual",
  "spiritual_orientation.structured_vs_experiential",
  "spiritual_orientation.traditional_vs_modern",
  "spiritual_orientation.ascetic_vs_balanced",
  "spiritual_orientation.ritual_heavy_vs_meditation_heavy",
  "community_structure.communal_vs_private",
  "community_structure.silent_vs_social",
  "community_structure.long_term_vs_retreat_based",
  "community_structure.lay_friendly_vs_monastic_oriented",
  "lifestyle.urban_vs_rural",
  "lifestyle.physically_demanding_vs_accessible",
  "lifestyle.digital_friendly_vs_unplugged",
  "lifestyle.strict_schedules_vs_flexible",
  "readiness.seriousness_level",
] as const;

export type UserPreferenceKey = (typeof USER_PREFERENCE_KEYS)[number];

/** Paths shared by discovery profile and community feature scores. */
export const SHARED_MATCHING_KEYS = [
  "spiritual_orientation.contemplative_vs_devotional",
  "spiritual_orientation.mystical_vs_intellectual",
  "spiritual_orientation.traditional_vs_modern",
  "lifestyle.urban_vs_rural",
  "lifestyle.digital_friendly_vs_unplugged",
  "readiness.seriousness_level",
] as const satisfies readonly (UserPreferenceKey & CommunityFeatureKey)[];
