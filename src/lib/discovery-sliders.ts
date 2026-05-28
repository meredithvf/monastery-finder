import type { ProfileTitle } from "@/lib/discovery-profile";
import { PROFILE_TITLES } from "@/lib/discovery-profile";
import type {
  CommunityScores,
  LifestyleScores,
  SpectrumScores,
} from "@/lib/discovery-profile";

export type DiscoverySliderValues = {
  title: ProfileTitle;
  spiritual_orientation: SpectrumScores;
  community_structure: CommunityScores;
  lifestyle: LifestyleScores;
  seriousness_level: number;
};

export type SpectrumSliderDef = {
  group: "spiritual_orientation" | "community_structure" | "lifestyle";
  field: string;
  leftLabel: string;
  rightLabel: string;
  description: string;
};

export const PROFILE_TITLE_OPTIONS: {
  value: ProfileTitle;
  description: string;
}[] = [
  {
    value: "Curious explorer",
    description:
      "You are browsing or visiting for the first time — open to many traditions and formats.",
  },
  {
    value: "Retreat seeker",
    description:
      "You want a focused stay (days to weeks) for rest, prayer, or renewal rather than long-term life change.",
  },
  {
    value: "Serious practitioner",
    description:
      "You already have a practice and want depth, discipline, or a teacher-led path.",
  },
  {
    value: "Long-term communal living",
    description:
      "You are considering months or years of shared life, work, and formation in community.",
  },
  {
    value: "Vocational/ordination interest",
    description:
      "You are exploring monastic vows, ordination, or a lifelong committed path.",
  },
];

export const SERIOUSNESS_LEVELS: {
  value: number;
  label: string;
  description: string;
}[] = [
  {
    value: 1,
    label: "Casual",
    description: "Light curiosity — a day visit or “see what it is like.”",
  },
  {
    value: 2,
    label: "Interested",
    description: "You would plan a short retreat and read up beforehand.",
  },
  {
    value: 3,
    label: "Committed",
    description:
      "You will arrange time off, budget, and logistics for a real stay.",
  },
  {
    value: 4,
    label: "Deepening",
    description:
      "You want ongoing formation, rule of life, or repeated residencies.",
  },
  {
    value: 5,
    label: "Vocational",
    description:
      "You are discerning vows, ordination, or long-term membership.",
  },
];

export const DISCOVERY_SLIDER_GROUPS: {
  title: string;
  sliders: SpectrumSliderDef[];
}[] = [
  {
    title: "Spiritual orientation",
    sliders: [
      {
        group: "spiritual_orientation",
        field: "contemplative_vs_devotional",
        leftLabel: "Contemplative",
        rightLabel: "Devotional",
        description:
          "Silence and interior prayer versus heartfelt liturgy, chanting, and affection for the divine.",
      },
      {
        group: "spiritual_orientation",
        field: "mystical_vs_intellectual",
        leftLabel: "Mystical",
        rightLabel: "Intellectual",
        description:
          "Direct experience and union versus study, theology, and reasoned inquiry.",
      },
      {
        group: "spiritual_orientation",
        field: "structured_vs_experiential",
        leftLabel: "Structured doctrine",
        rightLabel: "Experiential",
        description:
          "Clear teaching and creed versus open-ended practice and personal discovery.",
      },
      {
        group: "spiritual_orientation",
        field: "traditional_vs_modern",
        leftLabel: "Traditional",
        rightLabel: "Modern",
        description:
          "Ancient forms, language, and customs versus contemporary expression and culture.",
      },
      {
        group: "spiritual_orientation",
        field: "ascetic_vs_balanced",
        leftLabel: "Ascetic",
        rightLabel: "Balanced",
        description:
          "Simplicity, fasting, and renunciation versus moderate comfort and integration.",
      },
      {
        group: "spiritual_orientation",
        field: "ritual_heavy_vs_meditation_heavy",
        leftLabel: "Ritual-heavy",
        rightLabel: "Meditation-heavy",
        description:
          "Ceremony, sacraments, and rubrics versus extended sitting or silent practice.",
      },
    ],
  },
  {
    title: "Community structure",
    sliders: [
      {
        group: "community_structure",
        field: "communal_vs_private",
        leftLabel: "Communal",
        rightLabel: "Private",
        description:
          "Shared meals, work, and rooms close together versus more solitude and personal space.",
      },
      {
        group: "community_structure",
        field: "silent_vs_social",
        leftLabel: "Silent",
        rightLabel: "Social",
        description:
          "Strict silence and minimal conversation versus fellowship and open interaction.",
      },
      {
        group: "community_structure",
        field: "long_term_vs_retreat_based",
        leftLabel: "Long-term residency",
        rightLabel: "Retreat-based",
        description:
          "Months or years in community versus short, scheduled programs.",
      },
      {
        group: "community_structure",
        field: "lay_friendly_vs_monastic_oriented",
        leftLabel: "Lay-friendly",
        rightLabel: "Monastic-oriented",
        description:
          "Guests and lay associates welcome versus primarily professed monastics.",
      },
    ],
  },
  {
    title: "Lifestyle & setting",
    sliders: [
      {
        group: "lifestyle",
        field: "urban_vs_rural",
        leftLabel: "Urban",
        rightLabel: "Rural",
        description:
          "City temple or urban monastery versus countryside, forest, or remote land.",
      },
      {
        group: "lifestyle",
        field: "physically_demanding_vs_accessible",
        leftLabel: "Physically demanding",
        rightLabel: "Accessible",
        description:
          "Manual labor, long walks, or rugged terrain versus gentler routines and access needs.",
      },
      {
        group: "lifestyle",
        field: "digital_friendly_vs_unplugged",
        leftLabel: "Digital-friendly",
        rightLabel: "Unplugged",
        description:
          "Wi‑Fi and devices when needed versus no phones and full disconnection.",
      },
      {
        group: "lifestyle",
        field: "strict_schedules_vs_flexible",
        leftLabel: "Strict schedules",
        rightLabel: "Flexible",
        description:
          "Fixed horarium and bells versus adaptable timing and self-directed hours.",
      },
    ],
  },
];

export const DEFAULT_DISCOVERY_SLIDER_VALUES: DiscoverySliderValues = {
  title: PROFILE_TITLES[0],
  spiritual_orientation: {
    contemplative_vs_devotional: 50,
    mystical_vs_intellectual: 50,
    structured_vs_experiential: 50,
    traditional_vs_modern: 50,
    ascetic_vs_balanced: 50,
    ritual_heavy_vs_meditation_heavy: 50,
  },
  community_structure: {
    communal_vs_private: 50,
    silent_vs_social: 50,
    long_term_vs_retreat_based: 50,
    lay_friendly_vs_monastic_oriented: 50,
  },
  lifestyle: {
    urban_vs_rural: 50,
    physically_demanding_vs_accessible: 50,
    digital_friendly_vs_unplugged: 50,
    strict_schedules_vs_flexible: 50,
  },
  seriousness_level: 3,
};

export function getSliderValue(
  values: DiscoverySliderValues,
  slider: SpectrumSliderDef,
): number {
  if (slider.group === "spiritual_orientation") {
    return values.spiritual_orientation[slider.field as keyof SpectrumScores];
  }
  if (slider.group === "community_structure") {
    return values.community_structure[slider.field as keyof CommunityScores];
  }
  return values.lifestyle[slider.field as keyof LifestyleScores];
}

export function setSliderValue(
  values: DiscoverySliderValues,
  slider: SpectrumSliderDef,
  value: number,
): DiscoverySliderValues {
  if (slider.group === "spiritual_orientation") {
    return {
      ...values,
      spiritual_orientation: {
        ...values.spiritual_orientation,
        [slider.field]: value,
      },
    };
  }
  if (slider.group === "community_structure") {
    return {
      ...values,
      community_structure: {
        ...values.community_structure,
        [slider.field]: value,
      },
    };
  }
  return {
    ...values,
    lifestyle: {
      ...values.lifestyle,
      [slider.field]: value,
    },
  };
}
