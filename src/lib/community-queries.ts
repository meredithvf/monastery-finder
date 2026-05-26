import type { SupabaseClient } from "@supabase/supabase-js";
import { COMMUNITY_SELECT } from "@/lib/community-select";
import {
  firstRelation,
  parseScores,
  toCommunityMatchInput,
  toListItem,
} from "@/lib/community-transforms";
import { resolveWebsiteContent } from "@/lib/website-content";
import type {
  CommunityListItem,
  CommunityProfileJson,
  CommunityProfileRow,
  CommunityRow,
  CommunityScoresRow,
  CommunityWebsiteContent,
  CommunityWithRelations,
} from "@/lib/types/community";
import type { CommunityMatchInput } from "@/lib/matching/candidates";

export async function fetchCommunityMatchCandidates(
  supabase: SupabaseClient,
): Promise<CommunityMatchInput[]> {
  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT);
  if (error) throw new Error(error.message);
  return (data as CommunityWithRelations[]).map(toCommunityMatchInput);
}

/**
 * One `communities` query for discovery match: match inputs plus list rows for response enrichment.
 */
export async function fetchCommunitiesForDiscoveryMatch(
  supabase: SupabaseClient,
): Promise<{
  candidates: CommunityMatchInput[];
  listItemById: Map<string, CommunityListItem>;
}> {
  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_SELECT);
  if (error) throw new Error(error.message);
  const rows = data as CommunityWithRelations[];
  return {
    candidates: rows.map(toCommunityMatchInput),
    listItemById: new Map(rows.map((row) => [row.id, toListItem(row)])),
  };
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
