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
  contemplativeVsDevotional: number;
  mysticalVsIntellectual: number;
  structuredVsExperiential: number;
  traditionalVsModern: number;
  asceticVsBalanced: number;
  ritualHeavyVsMeditationHeavy: number;
}

export interface CommunityScores {
  communalVsPrivate: number;
  silentVsSocial: number;
  longTermVsRetreatBased: number;
  layFriendlyVsMonasticOriented: number;
}

export interface LifestyleScores {
  urbanVsRural: number;
  physicallyDemandingVsAccessible: number;
  digitalFriendlyVsUnplugged: number;
  strictSchedulesVsFlexible: number;
}

export interface PracticalConstraints {
  budget?: string;
  visaNeeds?: string;
  languageSupport?: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  ageConsiderations?: string;
  familyFriendliness?: string;
}

export interface ReadinessProfile {
  primaryIntent: string;
  seriousnessLevel: number;
  notes?: string;
}

export interface UserDiscoveryProfile {
  title: ProfileTitle;
  summary: string;
  spiritualOrientation: SpectrumScores;
  communityStructure: CommunityScores;
  lifestyle: LifestyleScores;
  practicalConstraints: PracticalConstraints;
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
      "Call only when you have enough information across spiritual orientation, community, lifestyle, practical constraints, and readiness to build a complete discovery profile.",
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
            "2-4 sentence narrative summary of who they are and what they are seeking.",
        },
        spiritualOrientation: {
          type: "object",
          properties: {
            contemplativeVsDevotional: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            mysticalVsIntellectual: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            structuredVsExperiential: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            traditionalVsModern: { type: "number", minimum: 0, maximum: 100 },
            asceticVsBalanced: { type: "number", minimum: 0, maximum: 100 },
            ritualHeavyVsMeditationHeavy: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "contemplativeVsDevotional",
            "mysticalVsIntellectual",
            "structuredVsExperiential",
            "traditionalVsModern",
            "asceticVsBalanced",
            "ritualHeavyVsMeditationHeavy",
          ],
        },
        communityStructure: {
          type: "object",
          properties: {
            communalVsPrivate: { type: "number", minimum: 0, maximum: 100 },
            silentVsSocial: { type: "number", minimum: 0, maximum: 100 },
            longTermVsRetreatBased: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            layFriendlyVsMonasticOriented: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "communalVsPrivate",
            "silentVsSocial",
            "longTermVsRetreatBased",
            "layFriendlyVsMonasticOriented",
          ],
        },
        lifestyle: {
          type: "object",
          properties: {
            urbanVsRural: { type: "number", minimum: 0, maximum: 100 },
            physicallyDemandingVsAccessible: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            digitalFriendlyVsUnplugged: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            strictSchedulesVsFlexible: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "urbanVsRural",
            "physicallyDemandingVsAccessible",
            "digitalFriendlyVsUnplugged",
            "strictSchedulesVsFlexible",
          ],
        },
        practicalConstraints: {
          type: "object",
          properties: {
            budget: { type: "string" },
            visaNeeds: { type: "string" },
            languageSupport: { type: "array", items: { type: "string" } },
            dietaryRestrictions: { type: "array", items: { type: "string" } },
            accessibilityNeeds: { type: "array", items: { type: "string" } },
            ageConsiderations: { type: "string" },
            familyFriendliness: { type: "string" },
          },
        },
        readiness: {
          type: "object",
          properties: {
            primaryIntent: {
              type: "string",
              description:
                "e.g. casual curiosity, ordination, burnout recovery, long-term residency, spiritual crisis, deep practice",
            },
            seriousnessLevel: {
              type: "number",
              minimum: 1,
              maximum: 5,
              description:
                "1 = casual curiosity, 5 = vocational/committed path",
            },
            notes: { type: "string" },
          },
          required: ["primaryIntent", "seriousnessLevel"],
        },
      },
      required: [
        "title",
        "summary",
        "spiritualOrientation",
        "communityStructure",
        "lifestyle",
        "practicalConstraints",
        "readiness",
      ],
    },
  },
};

export const SPECTRUM_LABELS = {
  spiritualOrientation: {
    contemplativeVsDevotional: ["Contemplative", "Devotional"],
    mysticalVsIntellectual: ["Mystical", "Intellectual"],
    structuredVsExperiential: ["Structured doctrine", "Experiential"],
    traditionalVsModern: ["Traditional", "Modern"],
    asceticVsBalanced: ["Ascetic", "Balanced"],
    ritualHeavyVsMeditationHeavy: ["Ritual-heavy", "Meditation-heavy"],
  },
  communityStructure: {
    communalVsPrivate: ["Communal", "Private"],
    silentVsSocial: ["Silent", "Social"],
    longTermVsRetreatBased: ["Long-term residency", "Retreat-based"],
    layFriendlyVsMonasticOriented: ["Lay-friendly", "Monastic-oriented"],
  },
  lifestyle: {
    urbanVsRural: ["Urban", "Rural"],
    physicallyDemandingVsAccessible: ["Physically demanding", "Accessible"],
    digitalFriendlyVsUnplugged: ["Digital-friendly", "Unplugged"],
    strictSchedulesVsFlexible: ["Strict schedules", "Flexible"],
  },
} as const;
