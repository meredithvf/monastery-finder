import { parseFeatureScores } from "@/lib/feature-scores";
import type {
  CommunityFeatureScores,
  LegacyFeatureScores,
} from "@/lib/types/community";
import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import {
  NEUTRAL_SCORE,
  READINESS_SERIOUSNESS_MAX,
  READINESS_SERIOUSNESS_MIN,
  USER_SPECTRUM_MAX,
} from "@/lib/matching/constants";
import {
  COMMUNITY_FEATURE_KEYS,
  type CommunityFeatureKey,
  USER_PREFERENCE_KEYS,
  type UserPreferenceKey,
} from "@/lib/matching/feature-keys";

export type NormalizedUserVector = Record<UserPreferenceKey, number>;
export type NormalizedCommunityVector = Record<CommunityFeatureKey, number>;

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Coerce a raw numeric feature to [0, 1].
 * - null / undefined / NaN → 0.5
 * - values in (1, 100] → treated as 0–100 percent scale
 * - values in [0, 1] → clamped
 * - other magnitudes → clamped to [0, 1]
 */
export function toUnitScore(
  value: unknown,
  options?: { assumePercentScale?: boolean },
): number {
  if (!isFiniteNumber(value)) return NEUTRAL_SCORE;

  const assumePercent =
    options?.assumePercentScale ??
    (value > 1 && value <= USER_SPECTRUM_MAX);

  if (assumePercent) {
    return clamp01(value / USER_SPECTRUM_MAX);
  }

  return clamp01(value);
}

/** Map readiness seriousness (1–5) to [0, 1]. */
export function seriousnessToUnit(value: unknown): number {
  if (!isFiniteNumber(value)) return NEUTRAL_SCORE;
  const span = READINESS_SERIOUSNESS_MAX - READINESS_SERIOUSNESS_MIN;
  return clamp01((value - READINESS_SERIOUSNESS_MIN) / span);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNestedNumber(
  root: unknown,
  groupKey: string,
  fieldKey: string,
): unknown {
  if (!isPlainObject(root)) return undefined;
  const group = root[groupKey];
  if (!isPlainObject(group)) return undefined;
  return group[fieldKey];
}

function fillVector<T extends string>(
  keys: readonly T[],
  resolve: (key: T) => number,
): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const key of keys) {
    out[key] = resolve(key);
  }
  return out;
}

function parseCommunityFeaturePath(key: CommunityFeatureKey): {
  group: keyof CommunityFeatureScores["features"];
  field: string;
} {
  const [group, field] = key.split(".") as [
    keyof CommunityFeatureScores["features"],
    string,
  ];
  return { group, field };
}

function readCommunityFeature(
  scores: CommunityFeatureScores,
  key: CommunityFeatureKey,
): unknown {
  const { group, field } = parseCommunityFeaturePath(key);
  const groupObj = scores.features[group];
  if (!groupObj || typeof groupObj !== "object") return undefined;
  return (groupObj as Record<string, unknown>)[field];
}

function parsePreferencePath(key: UserPreferenceKey): {
  group: string;
  field: string;
} {
  const [group, field] = key.split(".") as [string, string];
  return { group, field };
}

function readUserPreference(
  raw: unknown,
  key: UserPreferenceKey,
): unknown {
  const { group, field } = parsePreferencePath(key);
  return readNestedNumber(raw, group, field);
}

/**
 * Normalize discovery-chat user preferences to a fixed [0, 1] vector.
 * Keys use snake_case `group.field`, matching {@link UserDiscoveryProfile}.
 */
export function normalizeUserPreferences(
  raw: UserDiscoveryProfile | Partial<UserDiscoveryProfile> | unknown,
): NormalizedUserVector {
  return fillVector(USER_PREFERENCE_KEYS, (key) => {
    if (key === "readiness.seriousness_level") {
      return seriousnessToUnit(readUserPreference(raw, key));
    }

    const value = readUserPreference(raw, key);
    return toUnitScore(value, { assumePercentScale: true });
  });
}

/**
 * Normalize community feature scores to a fixed [0, 1] vector.
 * Legacy flat schemas are converted via {@link parseFeatureScores} first.
 */
export function normalizeCommunityFeatures(
  raw:
    | CommunityFeatureScores
    | LegacyFeatureScores
    | Partial<CommunityFeatureScores>
    | unknown,
): NormalizedCommunityVector {
  const parsed = parseFeatureScores(
    raw as CommunityFeatureScores | LegacyFeatureScores | null | undefined,
  );

  if (!parsed) {
    return fillVector(COMMUNITY_FEATURE_KEYS, () => NEUTRAL_SCORE);
  }

  return fillVector(COMMUNITY_FEATURE_KEYS, (key) => {
    const value = readCommunityFeature(parsed, key);
    return toUnitScore(value, { assumePercentScale: false });
  });
}
