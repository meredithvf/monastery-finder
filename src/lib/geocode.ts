const cache = new Map<string, { latitude: number; longitude: number }>();

export function buildLocationQuery(
  city: string,
  state: string,
  country?: string,
): string {
  const countryLabel =
    country === "US" || country === "USA" ? "United States" : country;
  return [city, state, countryLabel].filter(Boolean).join(", ");
}

export async function geocodeLocation(
  query: string,
  accessToken: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;

  const cached = cache.get(key);
  if (cached) return cached;

  const encoded = encodeURIComponent(query);
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`,
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("limit", "1");
  url.searchParams.set("types", "address,place,locality,region");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const json = (await res.json()) as {
    features?: Array<{ center?: [number, number] }>;
  };
  const center = json.features?.[0]?.center;
  if (!center || center.length < 2) return null;

  const coords = { longitude: center[0], latitude: center[1] };
  cache.set(key, coords);
  return coords;
}
