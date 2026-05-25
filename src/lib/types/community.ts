/** Mirrors monaster-finder-agent-system profile + scoring schemas */

export type ScoreUnit = number;
export type BinaryFeature = 0 | 1;

export type PracticeFeatures = {
  meditation_intensity: ScoreUnit;
  silence_level: ScoreUnit;
  study_vs_practice_balance: ScoreUnit;
};

export type CommunityFeatures = {
  communal_living_strength: ScoreUnit;
  residential_option_available: BinaryFeature;
  long_term_residency_supported: BinaryFeature;
  guest_stay_supported: BinaryFeature;
};

export type SocialFeatures = {
  social_interaction_level: ScoreUnit;
  community_size_estimate: ScoreUnit;
};

export type AccessibilityFeatures = {
  beginner_friendly: ScoreUnit;
  visitation_ease: ScoreUnit;
  application_difficulty: ScoreUnit;
};

export type CostFeatures = {
  cost_level: ScoreUnit;
  scholarship_available: ScoreUnit;
  volunteer_work_exchange_available: ScoreUnit;
};

export type LifestyleFeatures = {
  urban_vs_rural: ScoreUnit;
  spartan_vs_comfortable: ScoreUnit;
  daily_structure_rigidity: ScoreUnit;
};

export type CommunityFeatureGroups = {
  practice: PracticeFeatures;
  community: CommunityFeatures;
  social: SocialFeatures;
  accessibility: AccessibilityFeatures;
  cost: CostFeatures;
  lifestyle: LifestyleFeatures;
};

export type ExtractionSignals = {
  explicit_quotes: string[];
  extraction_confidence: ScoreUnit;
  missing_data_fields: string[];
};

/** Stored in `community_scores.feature_scores` (jsonb). */
export type CommunityFeatureScores = {
  name: string | null;
  website_summary: string | null;
  features: CommunityFeatureGroups;
  signals: ExtractionSignals;
};

/** Pre-migration flat scores still present in some rows. */
export type LegacyFeatureScores = {
  meditation_intensity?: number;
  communal_living_strength?: number;
  social_warmth?: number;
  hierarchy_strictness?: number;
  beginner_friendly_score?: number;
  cost_affordability?: number;
  accessibility_score?: number;
  rural_vs_urban_score?: number;
  composite_score?: number;
};

export type CommunityType =
  | "monastery"
  | "zen_center"
  | "temple"
  | "convent"
  | "abbey"
  | "retreat_center"
  | "intentional_community"
  | "other";

export type RuralUrban = "rural" | "urban" | "suburban" | "unknown";
export type TriState = "yes" | "no" | "mixed" | "unknown";

export type CommunityProfileJson = {
  coreIdentity: {
    id: string;
    name: string;
    types: CommunityType[];
    tradition: string;
    affiliation?: string;
    website: string;
  };
  geographic: {
    city: string;
    state: string;
    country: string;
    ruralUrban: RuralUrban;
    coordinates?: { latitude: number; longitude: number };
    region?: string;
  };
  display: {
    description: string;
    tags: string[];
    imageUrl?: string;
    summaryTagline?: string;
    etiquette?: {
      dressCode?: string;
      communicationStyle?: string;
      behaviorNotes?: string;
    };
    lastEnrichedAt?: string;
  };
  practice: {
    dailyLife: {
      scheduleSummary: string;
      silenceLevel: string;
      workPractice?: string;
      typicalDay?: string;
    };
    practiceStyle: {
      meditationIntensity: string;
      ritualLevel: string;
      studyVsPractice: string;
    };
    communityAtmosphere: {
      tone: string;
      communalityLevel: string;
    };
  };
  accessibility: {
    beginnerFriendly: TriState;
    englishSupport?: TriState;
    logistics: {
      cost: {
        min: number | null;
        max: number | null;
        currency: string;
      };
      stayOptions: string[];
      housingAvailable: string;
    };
  };
  fitSignals: {
    bestFor: string[];
    notSuitableFor: string[];
  };
  confidence: {
    overall: number;
    dataCompleteness: number;
    sourceQuality: number;
    inferenceLevel?: number;
  };
  evidence: {
    sources: Array<{ url: string; type: string }>;
    fieldEvidence?: Array<{ field: string; snippet: string; sourceUrl?: string }>;
  };
};

export type CommunityRow = {
  id: string;
  name: string;
  website: string;
  tradition: string;
  types: CommunityType[] | string[];
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
};

export type CommunityScoresRow = {
  community_id: string;
  overall: number;
  data_completeness: number;
  source_quality: number;
  inference_level: number | null;
  adjusted_overall: number;
  adjusted_data_completeness: number;
  adjusted_source_quality: number;
  adjusted_inference_level: number | null;
  feature_scores: CommunityFeatureScores | LegacyFeatureScores | null;
  updated_at?: string;
};

export type CommunityProfileRow = {
  community_id: string;
  profile: CommunityProfileJson;
  last_enriched_at: string;
};

export type CommunityWithRelations = CommunityRow & {
  community_profiles: CommunityProfileRow | CommunityProfileRow[] | null;
  community_scores: CommunityScoresRow | CommunityScoresRow[] | null;
};

export type CommunityListItem = {
  id: string;
  name: string;
  tradition: string;
  website: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  shortDescription: string;
  tags: string[];
  ruralUrban: RuralUrban;
  beginnerFriendly: TriState;
  costMin: number | null;
  costMax: number | null;
  adjustedOverall: number | null;
  beginnerFriendlyScore: number | null;
  costAffordability: number | null;
  ruralVsUrbanScore: number | null;
  compositeScore: number | null;
};

export type CommunityFilters = {
  tradition?: string;
  beginnerFriendly?: "yes" | "no" | "mixed" | "any";
  costRange?: "free" | "low" | "mid" | "high" | "any";
  setting?: "rural" | "urban" | "suburban" | "any";
  search?: string;
};

export type CommunitySort =
  | "score"
  | "distance"
  | "beginner_friendly";
