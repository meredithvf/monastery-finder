import type { CommunityMatchInput } from "@/lib/matching/candidates";
import {
  getBeginnerFriendlyScore,
  getCostAffordability,
  getLegacyCompositeScore,
  getSilenceLevelScore,
  getUnpluggedScore,
  getUrbanVsRuralScore,
  parseFeatureScores,
} from "@/lib/feature-scores";
import { isUnknownSentinel } from "@/lib/string-utils";
import type {
  CommunityListItem,
  CommunityProfileJson,
  CommunityRow,
  CommunityScoresRow,
  CommunityWithRelations,
} from "@/lib/types/community";

export function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function parseProfile(
  row: CommunityWithRelations,
): CommunityProfileJson | null {
  const rel = firstRelation(row.community_profiles);
  return rel?.profile ?? null;
}

export function parseScores(
  row: CommunityWithRelations,
): CommunityScoresRow | null {
  return firstRelation(row.community_scores);
}

export function formatLocation(
  row: Pick<CommunityRow, "city" | "state" | "country">,
): string {
  const parts = [row.city, row.state].filter(Boolean);
  if (row.country && row.country !== "US" && row.country !== "USA") {
    parts.push(row.country);
  }
  return parts.join(", ");
}

export function toListItem(row: CommunityWithRelations): CommunityListItem {
  const profile = parseProfile(row);
  const scores = parseScores(row);
  const featureScores = parseFeatureScores(scores?.feature_scores);

  const profileCoords = profile?.geographic?.coordinates;

  const types = profile?.coreIdentity?.types?.length
    ? profile.coreIdentity.types
    : row.types;

  return {
    id: row.id,
    name: row.name,
    tradition: row.tradition,
    types: types?.length ? types : [],
    website: row.website,
    city: row.city,
    state: row.state,
    country: row.country,
    latitude: row.latitude ?? profileCoords?.latitude ?? null,
    longitude: row.longitude ?? profileCoords?.longitude ?? null,
    shortDescription:
      profile?.display?.description?.slice(0, 280) ??
      profile?.display?.summaryTagline ??
      "",
    tags: profile?.display?.tags ?? [],
    ruralUrban: profile?.geographic?.ruralUrban ?? "unknown",
    silenceLevel: profile?.practice?.dailyLife?.silenceLevel ?? "unknown",
    beginnerFriendly: profile?.accessibility?.beginnerFriendly ?? "unknown",
    silenceLevelScore: getSilenceLevelScore(featureScores),
    unpluggedScore: getUnpluggedScore(featureScores),
    costMin: profile?.accessibility?.logistics?.cost?.min ?? null,
    costMax: profile?.accessibility?.logistics?.cost?.max ?? null,
    adjustedOverall: scores?.adjusted_overall ?? null,
    beginnerFriendlyScore: getBeginnerFriendlyScore(featureScores),
    costAffordability: getCostAffordability(featureScores),
    ruralVsUrbanScore: getUrbanVsRuralScore(featureScores),
    compositeScore: getLegacyCompositeScore(scores?.feature_scores),
  };
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function toCommunityMatchInput(
  row: CommunityWithRelations,
): CommunityMatchInput {
  const profile = parseProfile(row);
  const scores = parseScores(row);
  const region = profile?.geographic?.region;
  return {
    id: row.id,
    name: row.name,
    tradition: row.tradition,
    region: region && !isUnknownSentinel(region) ? region : null,
    features: scores?.feature_scores ?? null,
  };
}
