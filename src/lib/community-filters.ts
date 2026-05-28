import type {
  CommunityFilters,
  CommunityListItem,
} from "@/lib/types/community";

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

function matchesType(item: CommunityListItem, type?: string): boolean {
  if (!type) return true;
  return item.types.some((t) => t === type);
}

function matchesState(item: CommunityListItem, state?: string): boolean {
  if (!state) return true;
  return item.state.trim().toLowerCase() === state.trim().toLowerCase();
}

export function applyCommunityFilters(
  items: CommunityListItem[],
  filters: CommunityFilters,
): CommunityListItem[] {
  return items.filter((item) => {
    if (filters.tradition && item.tradition !== filters.tradition) return false;
    if (!matchesType(item, filters.type)) return false;
    if (!matchesState(item, filters.state)) return false;
    if (!matchesBeginnerFilter(item, filters.beginnerFriendly)) return false;
    if (!matchesCostRange(item, filters.costRange)) return false;
    if (!matchesSetting(item, filters.setting)) return false;
    if (!matchesSearch(item, filters.search)) return false;
    if (!matchesTags(item, filters.tags)) return false;
    return true;
  });
}
