import type {
  CommunityFeatureScores,
  LegacyFeatureScores,
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

/** Nested rows that predate budget / spiritual_orientation / readiness groups. */
function needsNestedFeatureMigration(raw: CommunityFeatureScores): boolean {
  const features = raw.features as Record<string, unknown>;
  return (
    "cost" in features ||
    !("budget" in features) ||
    !("spiritual_orientation" in features) ||
    !("readiness" in features)
  );
}

function migrateNestedFeatureScores(
  raw: CommunityFeatureScores,
): CommunityFeatureScores {
  const neutral = 0.5;
  const f = raw.features as CommunityFeatureScores["features"] &
    Record<string, Record<string, number | undefined>>;

  const legacyCost = f.cost as
    | {
        cost_level?: number;
        scholarship_available?: number;
        volunteer_work_exchange_available?: number;
      }
    | undefined;

  const legacyAccessibility = f.accessibility as
    | { beginner_friendly?: number; visitation_ease?: number }
    | undefined;

  return {
    ...raw,
    features: {
      practice: {
        meditation_intensity: f.practice?.meditation_intensity ?? neutral,
        silence_level: f.practice?.silence_level ?? neutral,
        study_vs_practice_balance: f.practice?.study_vs_practice_balance ?? neutral,
      },
      community: {
        communal_living_strength: f.community?.communal_living_strength ?? neutral,
        residential_option_available:
          (f.community?.residential_option_available as 0 | 1 | undefined) ?? 0,
        long_term_residency_supported:
          (f.community?.long_term_residency_supported as 0 | 1 | undefined) ?? 0,
        guest_stay_supported:
          (f.community?.guest_stay_supported as 0 | 1 | undefined) ?? 0,
        lay_friendly_vs_monastic_oriented:
          f.community?.lay_friendly_vs_monastic_oriented ?? neutral,
      },
      social: {
        social_interaction_level: f.social?.social_interaction_level ?? neutral,
        community_size_estimate: f.social?.community_size_estimate ?? neutral,
      },
      accessibility: {
        beginner_friendly:
          legacyAccessibility?.beginner_friendly ?? neutral,
      },
      budget: {
        budget: legacyCost?.cost_level ?? neutral,
        scholarship_available: legacyCost?.scholarship_available ?? neutral,
        volunteer_work_exchange_available:
          legacyCost?.volunteer_work_exchange_available ?? neutral,
      },
      lifestyle: {
        urban_vs_rural: f.lifestyle?.urban_vs_rural ?? neutral,
        spartan_vs_comfortable: f.lifestyle?.spartan_vs_comfortable ?? neutral,
        daily_structure_rigidity: f.lifestyle?.daily_structure_rigidity ?? neutral,
        digital_friendly_vs_unplugged:
          f.lifestyle?.digital_friendly_vs_unplugged ?? neutral,
      },
      spiritual_orientation: {
        contemplative_vs_devotional:
          f.spiritual_orientation?.contemplative_vs_devotional ?? neutral,
        mystical_vs_intellectual:
          f.spiritual_orientation?.mystical_vs_intellectual ?? neutral,
        traditional_vs_modern:
          f.spiritual_orientation?.traditional_vs_modern ?? neutral,
      },
      readiness: {
        seriousness_level: f.readiness?.seriousness_level ?? neutral,
      },
    },
  };
}

export function parseFeatureScores(
  raw: CommunityFeatureScores | LegacyFeatureScores | null | undefined,
): CommunityFeatureScores | null {
  if (!raw) return null;
  if (isLegacyFeatureScores(raw)) return legacyToCommunityFeatureScores(raw);
  if (!isCommunityFeatureScores(raw)) return null;
  if (needsNestedFeatureMigration(raw)) return migrateNestedFeatureScores(raw);
  return raw;
}

function legacyToCommunityFeatureScores(
  legacy: LegacyFeatureScores,
): CommunityFeatureScores {
  const neutral = 0.5;
  const budget =
    legacy.cost_affordability != null ? 1 - legacy.cost_affordability : neutral;

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
        lay_friendly_vs_monastic_oriented: neutral,
      },
      social: {
        social_interaction_level: legacy.social_warmth ?? neutral,
        community_size_estimate: neutral,
      },
      accessibility: {
        beginner_friendly: legacy.beginner_friendly_score ?? neutral,
      },
      budget: {
        budget,
        scholarship_available: neutral,
        volunteer_work_exchange_available: neutral,
      },
      lifestyle: {
        urban_vs_rural: legacy.rural_vs_urban_score ?? neutral,
        spartan_vs_comfortable: neutral,
        daily_structure_rigidity: neutral,
        digital_friendly_vs_unplugged: neutral,
      },
      spiritual_orientation: {
        contemplative_vs_devotional: neutral,
        mystical_vs_intellectual: neutral,
        traditional_vs_modern: neutral,
      },
      readiness: {
        seriousness_level: neutral,
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

/** Higher values indicate more silence. */
export function getSilenceLevelScore(
  scores: CommunityFeatureScores | null,
): number | null {
  return scores?.features.practice.silence_level ?? null;
}

/** Higher values indicate more unplugged / less digital-friendly. */
export function getUnpluggedScore(
  scores: CommunityFeatureScores | null,
): number | null {
  return scores?.features.lifestyle.digital_friendly_vs_unplugged ?? null;
}

/** 0 = expensive, 1 = affordable (inverse of `features.budget.budget`). */
export function getCostAffordability(
  scores: CommunityFeatureScores | null,
): number | null {
  const level = scores?.features.budget.budget;
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

type ScoredItem = {
  adjustedOverall?: number | null;
  compositeScore?: number | null;
};

export function getOverallScore(item: ScoredItem): number | null {
  return item.adjustedOverall ?? item.compositeScore ?? null;
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
  budget: "Budget",
  lifestyle: "Lifestyle",
  spiritual_orientation: "Spiritual orientation",
  readiness: "Readiness",
} as const;

export const FEATURE_FIELD_LABELS: Record<string, string> = {
  meditation_intensity: "Meditation intensity",
  silence_level: "Silence level",
  study_vs_practice_balance: "Study vs practice",
  communal_living_strength: "Communal living",
  residential_option_available: "Residential option",
  long_term_residency_supported: "Long-term residency",
  guest_stay_supported: "Guest stays",
  lay_friendly_vs_monastic_oriented: "Lay vs monastic",
  social_interaction_level: "Social interaction",
  community_size_estimate: "Community size",
  beginner_friendly: "Beginner friendly",
  budget: "Cost level",
  scholarship_available: "Scholarship available",
  volunteer_work_exchange_available: "Work exchange",
  urban_vs_rural: "Urban vs rural",
  spartan_vs_comfortable: "Spartan vs comfortable",
  daily_structure_rigidity: "Schedule rigidity",
  digital_friendly_vs_unplugged: "Digital vs unplugged",
  contemplative_vs_devotional: "Contemplative vs devotional",
  mystical_vs_intellectual: "Mystical vs intellectual",
  traditional_vs_modern: "Traditional vs modern",
  seriousness_level: "Seriousness",
  extraction_confidence: "Extraction confidence",
};
