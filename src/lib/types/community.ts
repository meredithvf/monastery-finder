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
  lay_friendly_vs_monastic_oriented: ScoreUnit;
};

export type SocialFeatures = {
  social_interaction_level: ScoreUnit;
  community_size_estimate: ScoreUnit;
};

export type AccessibilityFeatures = {
  beginner_friendly: ScoreUnit;
};

export type BudgetFeatures = {
  /** 0 = free/donation-based, 1 = expensive */
  budget: ScoreUnit;
  scholarship_available: ScoreUnit;
  volunteer_work_exchange_available: ScoreUnit;
};

export type LifestyleFeatures = {
  urban_vs_rural: ScoreUnit;
  spartan_vs_comfortable: ScoreUnit;
  daily_structure_rigidity: ScoreUnit;
  digital_friendly_vs_unplugged: ScoreUnit;
};

export type SpiritualOrientationFeatures = {
  contemplative_vs_devotional: ScoreUnit;
  mystical_vs_intellectual: ScoreUnit;
  traditional_vs_modern: ScoreUnit;
};

export type ReadinessFeatures = {
  /** 0 = casual, 1 = rigorous commitment */
  seriousness_level: ScoreUnit;
};

export type CommunityFeatureGroups = {
  practice: PracticeFeatures;
  community: CommunityFeatures;
  social: SocialFeatures;
  accessibility: AccessibilityFeatures;
  budget: BudgetFeatures;
  lifestyle: LifestyleFeatures;
  spiritual_orientation: SpiritualOrientationFeatures;
  readiness: ReadinessFeatures;
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
export type Level = "low" | "medium" | "high" | "unknown";
export type StudyVsPractice =
  | "study"
  | "balanced"
  | "practice-heavy"
  | "unknown";
export type CommunityTone =
  | "strict"
  | "warm"
  | "mixed"
  | "academic"
  | "mystical"
  | "unknown";
export type HousingAvailability = "yes" | "no" | "limited" | "unknown";
export type StayOption =
  | "retreat"
  | "short_term"
  | "long_term"
  | "resident"
  | "volunteer";

/** Hero image from `display.imageUrl`. */
export type WebsitePrimaryImage = {
  url: string;
  alt?: string;
};

/** One website summary section assembled from profile fields. */
export type WebsiteContentSection = {
  content: string;
};

/** Website summaries extracted from unified `community_profiles.profile` jsonb. */
export type CommunityWebsiteContent = {
  primaryImage?: WebsitePrimaryImage;
  homepage: WebsiteContentSection | null;
  about: WebsiteContentSection | null;
  retreats: WebsiteContentSection | null;
  programs: WebsiteContentSection | null;
  guidelines: WebsiteContentSection | null;
  pricing: WebsiteContentSection | null;
  schedule: WebsiteContentSection | null;
  residency: WebsiteContentSection | null;
  visitorInfo: WebsiteContentSection | null;
};

export const WEBSITE_CONTENT_FIELDS = [
  "homepage",
  "about",
  "retreats",
  "programs",
  "guidelines",
  "pricing",
  "schedule",
  "residency",
  "visitorInfo",
] as const;

export type WebsiteContentField = (typeof WEBSITE_CONTENT_FIELDS)[number];

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
    homepage?: string | null;
    about?: string | null;
    etiquette?: {
      dressCode?: string;
      communicationStyle?: string;
      behaviorNotes?: string;
      guidelines?: string | null;
    };
    lastEnrichedAt?: string;
  };
  practice: {
    dailyLife: {
      scheduleSummary: string;
      silenceLevel: Level;
      workPractice?: string;
      typicalDay?: string;
    };
    practiceStyle: {
      meditationIntensity: Level;
      ritualLevel: Level;
      studyVsPractice: StudyVsPractice;
    };
    communityAtmosphere: {
      tone: CommunityTone;
      communalityLevel: Level;
    };
  };
  accessibility: {
    beginnerFriendly: TriState;
    englishSupport?: TriState;
    culturalBarrier?: Level;
    applicationDifficulty?: Level;
    stayFlexibility?: Level;
    retreats?: string | null;
    programs?: string | null;
    pricing?: string | null;
    residency?: string | null;
    visitorInfo?: string | null;
    logistics: {
      cost: {
        min: number | null;
        max: number | null;
        currency: string;
      };
      stayOptions: StayOption[];
      housingAvailable: HousingAvailability;
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
    fieldEvidence?: Array<{
      field: string;
      snippet: string;
      sourceUrl?: string;
    }>;
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

export type CommunitySort = "score" | "distance" | "beginner_friendly";
