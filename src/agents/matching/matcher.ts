import type {
  CommunityMatchInput,
  MatchHardConstraints,
  RankCommunitiesOptions,
  RankedCommunityMatch,
} from "@/lib/matching/candidates";
import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import {
  toAlignedCommunityVector,
  toAlignedUserVector,
  type AlignedMatchingKey,
} from "@/lib/matching/alignment";
import { weightedMatchScore } from "@/lib/matching/distance";
import {
  normalizeCommunityFeatures,
  normalizeUserPreferences,
  type NormalizedCommunityVector,
  type NormalizedUserVector,
} from "@/lib/matching/normalize";
import { FEATURE_FIELD_LABELS } from "@/lib/feature-scores";

function normalizeConstraintValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower === "none" || lower === "none specified" || lower === "unknown") {
    return undefined;
  }
  return trimmed;
}

export function extractHardConstraints(
  profile: UserDiscoveryProfile,
): MatchHardConstraints {
  const practical = profile.practical_constraints;
  return {
    region: normalizeConstraintValue(practical.region),
    tradition: normalizeConstraintValue(practical.tradition),
  };
}

function constraintValuesEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Returns false when the community conflicts with a user-specified region or tradition.
 * Missing community metadata does not count as a mismatch.
 */
export function passesHardConstraints(
  constraints: MatchHardConstraints,
  community: Pick<CommunityMatchInput, "tradition" | "region">,
): boolean {
  const preferredRegion = normalizeConstraintValue(constraints.region);
  if (preferredRegion) {
    const communityRegion = normalizeConstraintValue(community.region ?? undefined);
    if (
      communityRegion &&
      !constraintValuesEqual(preferredRegion, communityRegion)
    ) {
      return false;
    }
  }

  const preferredTradition = normalizeConstraintValue(constraints.tradition);
  if (preferredTradition) {
    const communityTradition = normalizeConstraintValue(community.tradition);
    if (
      communityTradition &&
      !constraintValuesEqual(preferredTradition, communityTradition)
    ) {
      return false;
    }
  }

  return true;
}

function resolveCommunityVector(
  features: CommunityMatchInput["features"],
): NormalizedCommunityVector {
  if (!features) {
    return normalizeCommunityFeatures(null);
  }

  const maybeVector = features as NormalizedCommunityVector;
  if (
    typeof maybeVector === "object" &&
    "practice.meditation_intensity" in maybeVector
  ) {
    return maybeVector;
  }

  return normalizeCommunityFeatures(features);
}

function resolveUserVector(
  userVector: NormalizedUserVector | UserDiscoveryProfile,
): NormalizedUserVector {
  if ("spiritual_orientation" in userVector) {
    return normalizeUserPreferences(userVector);
  }
  return userVector;
}

function labelForAlignedKey(key: AlignedMatchingKey): string {
  const field = key.includes(".") ? key.split(".").pop()! : key;
  return FEATURE_FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

function buildHighlights(
  userAligned: ReturnType<typeof toAlignedUserVector>,
  communityAligned: ReturnType<typeof toAlignedCommunityVector>,
  limit = 3,
): string[] {
  const deltas = (Object.keys(userAligned) as AlignedMatchingKey[])
    .map((key) => ({
      key,
      delta: Math.abs(userAligned[key] - communityAligned[key]),
    }))
    .sort((a, b) => a.delta - b.delta);

  return deltas.slice(0, limit).map(({ key }) => labelForAlignedKey(key));
}

function buildExplanation(
  community: CommunityMatchInput,
  score: number,
  highlights: string[],
): string {
  const pct = Math.round(score * 100);
  const highlightText =
    highlights.length > 0
      ? ` Strongest alignment on ${highlights.join(", ").toLowerCase()}.`
      : "";
  const regionText = community.region ? ` Located in ${community.region}.` : "";
  return `${community.name} (${community.tradition}) is a ${pct}% fit.${highlightText}${regionText}`;
}

/**
 * Rank communities by weighted vector distance against the user profile.
 * Applies hard region/tradition filters when specified on the user profile.
 */
export function rankCommunities(
  userVector: NormalizedUserVector | UserDiscoveryProfile,
  communities: CommunityMatchInput[],
  options: RankCommunitiesOptions = {},
): RankedCommunityMatch[] {
  const normalizedUser = resolveUserVector(userVector);
  const userAligned = toAlignedUserVector(normalizedUser);
  const constraints = options.constraints ?? {};

  const scored: RankedCommunityMatch[] = [];

  for (const community of communities) {
    if (!passesHardConstraints(constraints, community)) continue;

    const normalizedCommunity = resolveCommunityVector(community.features);
    const communityAligned = toAlignedCommunityVector(normalizedCommunity);
    const score = weightedMatchScore(userAligned, communityAligned, options.weights);
    const highlights = buildHighlights(userAligned, communityAligned);

    scored.push({
      id: community.id,
      name: community.name,
      tradition: community.tradition,
      region: community.region ?? null,
      score,
      highlights,
      explanation: buildExplanation(community, score, highlights),
    });
  }

  return scored.sort((a, b) => b.score - a.score);
}
