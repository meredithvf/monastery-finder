import type { CommunityMatchInput } from "@/lib/matching/candidates";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getBeginnerFriendlyScore,
  getCostAffordability,
  getLegacyCompositeScore,
  getOverallScore,
  getUrbanVsRuralScore,
  parseFeatureScores,
} from "@/lib/feature-scores";
import { isUnknownSentinel } from "@/lib/string-utils";
import { resolveWebsiteContent } from "@/lib/website-content";
import type {
  CommunityFilters,
  CommunityListItem,
  CommunityProfileJson,
  CommunityProfileRow,
  CommunityRow,
  CommunityScoresRow,
  CommunitySort,
  CommunityWebsiteContent,
  CommunityWithRelations,
} from "@/lib/types/community";

const COMMUNITY_SELECT = `
  *,
  community_profiles ( community_id, profile, last_enriched_at ),
  community_scores (
    community_id,
    overall,
    data_completeness,
    source_quality,
    inference_level,
    adjusted_overall,
    adjusted_data_completeness,
    adjusted_source_quality,
    adjusted_inference_level,
    feature_scores,
    updated_at
  )
`;

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parseProfile(row: CommunityWithRelations): CommunityProfileJson | null {
  const rel = firstRelation(row.community_profiles);
  return rel?.profile ?? null;
}

function parseScores(row: CommunityWithRelations): CommunityScoresRow | null {
  return firstRelation(row.community_scores);
}

export function formatLocation(row: Pick<CommunityRow, "city" | "state" | "country">): string {
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

  return {
    id: row.id,
    name: row.name,
    tradition: row.tradition,
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
    beginnerFriendly: profile?.accessibility?.beginnerFriendly ?? "unknown",
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

function matchesCostRange(
  item: CommunityListItem,
  range: CommunityFilters["costRange"],
): boolean {
  if (!range || range === "any") return true;
  const min = item.costMin;
  const max = item.costMax ?? item.costMin;
  const affordability = item.costAffordability;

  if (range === "free") {
    return (min === 0 || min === null) && (max === 0 || max === null);
  }
  if (affordability != null) {
    if (range === "low") return affordability >= 0.66;
    if (range === "mid") return affordability >= 0.33 && affordability < 0.66;
    if (range === "high") return affordability < 0.33;
  }
  if (min == null && max == null) return range === "mid";
  const ceiling = max ?? min ?? 0;
  if (range === "low") return ceiling <= 50;
  if (range === "mid") return ceiling > 50 && ceiling <= 200;
  return ceiling > 200;
}

function matchesBeginnerFilter(
  item: CommunityListItem,
  filter: CommunityFilters["beginnerFriendly"],
): boolean {
  if (!filter || filter === "any") return true;
  if (item.beginnerFriendly === filter) return true;
  if (filter === "yes" && (item.beginnerFriendlyScore ?? 0) >= 0.65) return true;
  if (filter === "no" && (item.beginnerFriendlyScore ?? 1) <= 0.35) return true;
  return false;
}

function matchesSetting(
  item: CommunityListItem,
  setting: CommunityFilters["setting"],
): boolean {
  if (!setting || setting === "any") return true;
  if (item.ruralUrban === setting) return true;
  const score = item.ruralVsUrbanScore;
  if (score == null) return item.ruralUrban === "unknown";
  if (setting === "rural") return score >= 0.6;
  if (setting === "urban") return score <= 0.4;
  if (setting === "suburban") return score > 0.4 && score < 0.6;
  return true;
}

function matchesSearch(item: CommunityListItem, search?: string): boolean {
  const q = search?.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    item.name,
    item.tradition,
    item.city,
    item.state,
    item.shortDescription,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function matchesTags(
  item: CommunityListItem,
  tags: CommunityFilters["tags"],
): boolean {
  if (!tags || tags.length === 0) return true;
  const itemTags = item.tags.map((t) => t.toLowerCase());
  return tags.every((tag) => itemTags.includes(tag.toLowerCase()));
}

export function applyCommunityFilters(
  items: CommunityListItem[],
  filters: CommunityFilters,
): CommunityListItem[] {
  return items.filter((item) => {
    if (filters.tradition && item.tradition !== filters.tradition) return false;
    if (!matchesBeginnerFilter(item, filters.beginnerFriendly)) return false;
    if (!matchesCostRange(item, filters.costRange)) return false;
    if (!matchesSetting(item, filters.setting)) return false;
    if (!matchesSearch(item, filters.search)) return false;
    if (!matchesTags(item, filters.tags)) return false;
    return true;
  });
}

export function sortCommunities(
  items: CommunityListItem[],
  sort: CommunitySort,
  userCoords?: { latitude: number; longitude: number } | null,
): CommunityListItem[] {
  const sorted = [...items];
  if (sort === "score") {
    sorted.sort(
      (a, b) => (getOverallScore(b) ?? 0) - (getOverallScore(a) ?? 0),
    );
  } else if (sort === "beginner_friendly") {
    sorted.sort(
      (a, b) =>
        (b.beginnerFriendlyScore ?? 0) - (a.beginnerFriendlyScore ?? 0),
    );
  } else if (sort === "distance" && userCoords) {
    sorted.sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? haversineKm(
              userCoords.latitude,
              userCoords.longitude,
              a.latitude,
              a.longitude,
            )
          : Infinity;
      const db =
        b.latitude != null && b.longitude != null
          ? haversineKm(
              userCoords.latitude,
              userCoords.longitude,
              b.latitude,
              b.longitude,
            )
          : Infinity;
      return da - db;
    });
  }
  return sorted;
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

export async function fetchCommunityMatchCandidates(
  supabase: SupabaseClient,
): Promise<CommunityMatchInput[]> {
  const { data, error } = await supabase.from("communities").select(COMMUNITY_SELECT);
  if (error) throw new Error(error.message);
  return (data as CommunityWithRelations[]).map(toCommunityMatchInput);
}

export async function fetchCommunities(
  supabase: SupabaseClient,
  options?: { requireCoordinates?: boolean },
): Promise<CommunityListItem[]> {
  let query = supabase.from("communities").select(COMMUNITY_SELECT);
  if (options?.requireCoordinates) {
    query = query.not("latitude", "is", null).not("longitude", "is", null);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as CommunityWithRelations[]).map(toListItem);
}

export async function fetchCommunityById(
  supabase: SupabaseClient,
  id: string,
): Promise<{
  community: CommunityRow;
  profile: CommunityProfileJson | null;
  scores: CommunityScoresRow | null;
  profileMeta: CommunityProfileRow | null;
  websiteContent: CommunityWebsiteContent | null;
} | null> {
  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as CommunityWithRelations;
  const profileRel = firstRelation(row.community_profiles);
  const profile = profileRel?.profile ?? null;
  return {
    community: row,
    profile,
    scores: parseScores(row),
    profileMeta: profileRel,
    websiteContent: resolveWebsiteContent(profile),
  };
}

export function getUniqueTraditions(items: CommunityListItem[]): string[] {
  return [...new Set(items.map((i) => i.tradition).filter(Boolean))].sort();
}
