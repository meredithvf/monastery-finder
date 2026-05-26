export const PROFILE_TITLES = [
  "Curious explorer",
  "Retreat seeker",
  "Serious practitioner",
  "Long-term communal living",
  "Vocational/ordination interest",
] as const;

export type ProfileTitle = (typeof PROFILE_TITLES)[number];

export interface SpectrumScores {
  /** 0 = left pole, 100 = right pole */
  contemplative_vs_devotional: number;
  mystical_vs_intellectual: number;
  structured_vs_experiential: number;
  traditional_vs_modern: number;
  ascetic_vs_balanced: number;
  ritual_heavy_vs_meditation_heavy: number;
}

export interface CommunityScores {
  communal_vs_private: number;
  silent_vs_social: number;
  long_term_vs_retreat_based: number;
  lay_friendly_vs_monastic_oriented: number;
}

export interface LifestyleScores {
  urban_vs_rural: number;
  physically_demanding_vs_accessible: number;
  digital_friendly_vs_unplugged: number;
  strict_schedules_vs_flexible: number;
}

export interface PracticalConstraints {
  budget?: string;
  visa_needs?: string;
  language_support?: string[];
  dietary_restrictions?: string[];
  accessibility_needs?: string[];
  age_considerations?: string;
  family_friendliness?: string;
  /** Geographic region preference for hard filtering (e.g. "Pacific Northwest"). */
  region?: string;
  /** Spiritual tradition preference for hard filtering (e.g. "Benedictine"). */
  tradition?: string;
}

export interface ReadinessProfile {
  primary_intent: string;
  seriousness_level: number;
  notes?: string;
}

export interface UserDiscoveryProfile {
  title: ProfileTitle;
  summary: string;
  spiritual_orientation: SpectrumScores;
  community_structure: CommunityScores;
  lifestyle: LifestyleScores;
  practical_constraints: PracticalConstraints;
  readiness: ReadinessProfile;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const DISCOVERY_PROFILE_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_discovery_profile",
    description:
      "Call only when you have enough information across spiritual orientation, community, lifestyle, practical constraints, and readiness to build a complete discovery profile. Use snake_case property names exactly as defined in the schema.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          enum: [...PROFILE_TITLES],
          description: "Best-fit profile title for this user.",
        },
        summary: {
          type: "string",
          description:
            "2-3 sentence narrative in second person (you/your), describing what they are seeking and what matters to them.",
        },
        spiritual_orientation: {
          type: "object",
          properties: {
            contemplative_vs_devotional: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            mystical_vs_intellectual: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            structured_vs_experiential: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            traditional_vs_modern: { type: "number", minimum: 0, maximum: 100 },
            ascetic_vs_balanced: { type: "number", minimum: 0, maximum: 100 },
            ritual_heavy_vs_meditation_heavy: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "contemplative_vs_devotional",
            "mystical_vs_intellectual",
            "structured_vs_experiential",
            "traditional_vs_modern",
            "ascetic_vs_balanced",
            "ritual_heavy_vs_meditation_heavy",
          ],
        },
        community_structure: {
          type: "object",
          properties: {
            communal_vs_private: { type: "number", minimum: 0, maximum: 100 },
            silent_vs_social: { type: "number", minimum: 0, maximum: 100 },
            long_term_vs_retreat_based: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            lay_friendly_vs_monastic_oriented: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "communal_vs_private",
            "silent_vs_social",
            "long_term_vs_retreat_based",
            "lay_friendly_vs_monastic_oriented",
          ],
        },
        lifestyle: {
          type: "object",
          properties: {
            urban_vs_rural: { type: "number", minimum: 0, maximum: 100 },
            physically_demanding_vs_accessible: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            digital_friendly_vs_unplugged: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            strict_schedules_vs_flexible: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "urban_vs_rural",
            "physically_demanding_vs_accessible",
            "digital_friendly_vs_unplugged",
            "strict_schedules_vs_flexible",
          ],
        },
        practical_constraints: {
          type: "object",
          properties: {
            budget: { type: "string" },
            visa_needs: { type: "string" },
            language_support: { type: "array", items: { type: "string" } },
            dietary_restrictions: { type: "array", items: { type: "string" } },
            accessibility_needs: { type: "array", items: { type: "string" } },
            age_considerations: { type: "string" },
            family_friendliness: { type: "string" },
            region: {
              type: "string",
              description:
                "Preferred geographic region when the user states one; omit if not specified.",
            },
            tradition: {
              type: "string",
              description:
                "Preferred spiritual tradition when the user states one; omit if not specified.",
            },
          },
        },
        readiness: {
          type: "object",
          properties: {
            primary_intent: {
              type: "string",
              description:
                "e.g. casual curiosity, ordination, burnout recovery, long-term residency, spiritual crisis, deep practice",
            },
            seriousness_level: {
              type: "number",
              minimum: 1,
              maximum: 5,
              description:
                "1 = casual curiosity, 5 = vocational/committed path",
            },
            notes: { type: "string" },
          },
          required: ["primary_intent", "seriousness_level"],
        },
      },
      required: [
        "title",
        "summary",
        "spiritual_orientation",
        "community_structure",
        "lifestyle",
        "practical_constraints",
        "readiness",
      ],
    },
  },
};

export const SPECTRUM_LABELS = {
  spiritual_orientation: {
    contemplative_vs_devotional: ["Contemplative", "Devotional"],
    mystical_vs_intellectual: ["Mystical", "Intellectual"],
    structured_vs_experiential: ["Structured doctrine", "Experiential"],
    traditional_vs_modern: ["Traditional", "Modern"],
    ascetic_vs_balanced: ["Ascetic", "Balanced"],
    ritual_heavy_vs_meditation_heavy: ["Ritual-heavy", "Meditation-heavy"],
  },
  community_structure: {
    communal_vs_private: ["Communal", "Private"],
    silent_vs_social: ["Silent", "Social"],
    long_term_vs_retreat_based: ["Long-term residency", "Retreat-based"],
    lay_friendly_vs_monastic_oriented: ["Lay-friendly", "Monastic-oriented"],
  },
  lifestyle: {
    urban_vs_rural: ["Urban", "Rural"],
    physically_demanding_vs_accessible: ["Physically demanding", "Accessible"],
    digital_friendly_vs_unplugged: ["Digital-friendly", "Unplugged"],
    strict_schedules_vs_flexible: ["Strict schedules", "Flexible"],
  },
} as const;
