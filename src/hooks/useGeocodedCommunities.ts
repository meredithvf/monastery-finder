"use client";

import { useEffect, useMemo, useState } from "react";
import { buildLocationQuery, geocodeLocation } from "@/lib/geocode";
import type { CommunityListItem } from "@/lib/types/community";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export function useGeocodedCommunities(items: CommunityListItem[]) {
  const [geocoded, setGeocoded] = useState<
    Record<string, { latitude: number; longitude: number }>
  >({});

  const needsGeocodeKey = useMemo(() => {
    return items
      .filter((i) => (i.latitude == null || i.longitude == null) && i.city)
      .map((i) => i.id)
      .sort()
      .join(",");
  }, [items]);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !needsGeocodeKey) return;

    const pending = items.filter(
      (i) => (i.latitude == null || i.longitude == null) && i.city,
    );
    if (pending.length === 0) return;

    let cancelled = false;

    void (async () => {
      for (const item of pending) {
        if (cancelled) return;
        const query = buildLocationQuery(item.city, item.state, item.country);
        const result = await geocodeLocation(query, MAPBOX_TOKEN);
        if (cancelled || !result) continue;
        setGeocoded((prev) => {
          if (prev[item.id]) return prev;
          return {
            ...prev,
            [item.id]: {
              latitude: result.latitude,
              longitude: result.longitude,
            },
          };
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needsGeocodeKey, items]);

  return useMemo(
    () =>
      items.map((item) => {
        if (item.latitude != null && item.longitude != null) return item;
        const coords = geocoded[item.id];
        if (!coords) return item;
        return {
          ...item,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }),
    [items, geocoded],
  );
}
