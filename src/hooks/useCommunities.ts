"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyCommunityFilters,
  fetchCommunities,
  getUniqueCommunityTypes,
  getUniqueStates,
  getUniqueTraditions,
  sortCommunities,
} from "@/lib/communities";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type {
  CommunityFilters,
  CommunityListItem,
  CommunitySort,
} from "@/lib/types/community";
import { useGeocodedCommunities } from "./useGeocodedCommunities";

type UseCommunitiesOptions = {
  filters?: CommunityFilters;
  sort?: CommunitySort;
  userCoords?: { latitude: number; longitude: number } | null;
  requireCoordinates?: boolean;
};

export function useCommunities(options: UseCommunitiesOptions = {}) {
  const {
    filters,
    sort = "score",
    userCoords = null,
    requireCoordinates = false,
  } = options;
  const [items, setItems] = useState<CommunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchCommunities(supabase, { requireCoordinates });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [requireCoordinates]);

  useEffect(() => {
    void load();
  }, [load]);

  const traditions = useMemo(() => getUniqueTraditions(items), [items]);
  const communityTypes = useMemo(
    () => getUniqueCommunityTypes(items),
    [items],
  );
  const states = useMemo(() => getUniqueStates(items), [items]);

  const filtered = useMemo(() => {
    const next = filters ? applyCommunityFilters(items, filters) : items;
    return sortCommunities(next, sort, userCoords);
  }, [items, filters, sort, userCoords]);

  const withCoordinates = useGeocodedCommunities(filtered);

  const mappable = useMemo(
    () =>
      withCoordinates.filter(
        (c) => c.latitude != null && c.longitude != null,
      ),
    [withCoordinates],
  );

  return {
    items,
    filtered,
    mappable,
    traditions,
    communityTypes,
    states,
    loading,
    error,
    reload: load,
  };
}
