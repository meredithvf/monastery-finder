import type { CommunityListItem } from "@/lib/types/community";

export const US_MAP_CENTER = {
  longitude: -98.5,
  latitude: 39.5,
  zoom: 3.5,
};

/** SW and NE corners — continental US, Alaska, and Hawaii */
export const US_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-171.8, 18.2],
  [-64.5, 71.5],
];

export function isUSCountry(country: string): boolean {
  const normalized = country.trim().toUpperCase();
  return (
    normalized === "US" ||
    normalized === "USA" ||
    normalized === "UNITED STATES"
  );
}

export function isUSCommunity(
  item: Pick<CommunityListItem, "country">,
): boolean {
  return isUSCountry(item.country);
}
