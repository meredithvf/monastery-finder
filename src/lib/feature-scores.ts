import type {
  CommunityFeatureScores,
  LegacyFeatureScores,
  ScoreUnit,
} from "@/lib/types/community";

export function isCommunityFeatureScores(
  raw: unknown,
): raw is CommunityFeatureScores {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.features === "object" &&
    obj.features !== null &&
    typeof (obj.features as Record<string, unknown>).practice === "object"
  );
}

export function isLegacyFeatureScores(raw: unknown): raw is LegacyFeatureScores {
  if (!raw || typeof raw !== "object" || isCommunityFeatureScores(raw)) {
    return false;
  }
  const obj = raw as LegacyFeatureScores;
  return (
    "meditation_intensity" in obj ||
    "communal_living_strength" in obj ||
    "beginner_friendly_score" in obj ||
    "cost_affordability" in obj ||
    "rural_vs_urban_score" in obj ||
    "social_warmth" in obj ||
    "composite_score" in obj
  );
}

export function parseFeatureScores(
  raw: CommunityFeatureScores | LegacyFeatureScores | null | undefined,
): CommunityFeatureScores | null {
  if (!raw) return null;
  if (isCommunityFeatureScores(raw)) return raw;
  if (!isLegacyFeatureScores(raw)) return null;
  return legacyToCommunityFeatureScores(raw);
}

function legacyToCommunityFeatureScores(
  legacy: LegacyFeatureScores,
): CommunityFeatureScores {
  const neutral = 0.5;
  return {
    name: null,
    website_summary: null,
    features: {
      practice: {
        meditation_intensity: legacy.meditation_intensity ?? neutral,
        silence_level: neutral,
        study_vs_practice_balance: neutral,
      },
      community: {
        communal_living_strength: legacy.communal_living_strength ?? neutral,
        residential_option_available: 0,
        long_term_residency_supported: 0,
        guest_stay_supported: 0,
      },
      social: {
        social_interaction_level: legacy.social_warmth ?? neutral,
        community_size_estimate: neutral,
      },
      accessibility: {
        beginner_friendly: legacy.beginner_friendly_score ?? neutral,
        visitation_ease: legacy.accessibility_score ?? neutral,
        application_difficulty: neutral,
      },
      cost: {
        cost_level:
          legacy.cost_affordability != null
            ? 1 - legacy.cost_affordability
            : neutral,
        scholarship_available: neutral,
        volunteer_work_exchange_available: neutral,
      },
      lifestyle: {
        urban_vs_rural: legacy.rural_vs_urban_score ?? neutral,
        spartan_vs_comfortable: neutral,
        daily_structure_rigidity: neutral,
      },
    },
    signals: {
      explicit_quotes: [],
      extraction_confidence: neutral,
      missing_data_fields: [],
    },
  };
}

export function getBeginnerFriendlyScore(
  scores: CommunityFeatureScores | null,
): number | null {
  return scores?.features.accessibility.beginner_friendly ?? null;
}

/** 0 = expensive, 1 = affordable (inverse of cost_level). */
export function getCostAffordability(
  scores: CommunityFeatureScores | null,
): number | null {
  const level = scores?.features.cost.cost_level;
  if (level == null) return null;
  return 1 - level;
}

/** 0 = urban, 1 = rural (same as urban_vs_rural). */
export function getUrbanVsRuralScore(
  scores: CommunityFeatureScores | null,
): number | null {
  return scores?.features.lifestyle.urban_vs_rural ?? null;
}

export function getLegacyCompositeScore(
  raw: CommunityFeatureScores | LegacyFeatureScores | null | undefined,
): number | null {
  if (!raw || isCommunityFeatureScores(raw)) return null;
  return (raw as LegacyFeatureScores).composite_score ?? null;
}

export function formatScorePct(value: ScoreUnit | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function formatBinaryFeature(
  value: 0 | 1 | null | undefined,
): string {
  if (value === 1) return "Yes";
  if (value === 0) return "No";
  return "—";
}

export const FEATURE_GROUP_LABELS = {
  practice: "Practice",
  community: "Community",
  social: "Social",
  accessibility: "Accessibility",
  cost: "Cost",
  lifestyle: "Lifestyle",
} as const;

export const FEATURE_FIELD_LABELS: Record<string, string> = {
  meditation_intensity: "Meditation intensity",
  silence_level: "Silence level",
  study_vs_practice_balance: "Study vs practice",
  communal_living_strength: "Communal living",
  residential_option_available: "Residential option",
  long_term_residency_supported: "Long-term residency",
  guest_stay_supported: "Guest stays",
  social_interaction_level: "Social interaction",
  community_size_estimate: "Community size",
  beginner_friendly: "Beginner friendly",
  visitation_ease: "Visitation ease",
  application_difficulty: "Application difficulty",
  cost_level: "Cost level",
  scholarship_available: "Scholarship available",
  volunteer_work_exchange_available: "Work exchange",
  urban_vs_rural: "Urban vs rural",
  spartan_vs_comfortable: "Spartan vs comfortable",
  daily_structure_rigidity: "Schedule rigidity",
  extraction_confidence: "Extraction confidence",
};
