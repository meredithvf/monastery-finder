"use client";

import { useEffect, useMemo, useState } from "react";
import { buildLocationQuery, geocodeLocation } from "@/lib/geocode";
import type { CommunityListItem } from "@/lib/types/community";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
const GEOCODE_CONCURRENCY = 6;

async function geocodeBatch(
  pending: CommunityListItem[],
  cancelledRef: { current: boolean },
) {
  const updates: Record<string, { latitude: number; longitude: number }> = {};
  let cursor = 0;

  async function worker() {
    while (!cancelledRef.current) {
      const current = pending[cursor];
      cursor += 1;
      if (!current) return;

      const query = buildLocationQuery(
        current.city,
        current.state,
        current.country,
      );
      const result = await geocodeLocation(query, MAPBOX_TOKEN);
      if (!result || cancelledRef.current) continue;
      updates[current.id] = {
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(GEOCODE_CONCURRENCY, pending.length) }, () =>
      worker(),
    ),
  );

  return updates;
}

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

    const cancelledRef = { current: false };

    void (async () => {
      const updates = await geocodeBatch(pending, cancelledRef);
      if (cancelledRef.current || Object.keys(updates).length === 0) return;

      setGeocoded((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, coords] of Object.entries(updates)) {
          if (next[id]) continue;
          next[id] = coords;
          changed = true;
        }
        return changed ? next : prev;
      });
    })();

    return () => {
      cancelledRef.current = true;
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
