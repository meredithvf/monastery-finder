"use client";

import { useCallback, useMemo, useState } from "react";
import type { CommunityFilters, CommunitySort } from "@/lib/types/community";

const DEFAULT_FILTERS: CommunityFilters = {
  tradition: undefined,
  beginnerFriendly: "any",
  costRange: "any",
  setting: "any",
  search: "",
  tags: [],
};

export function useCommunityFilters(initial?: Partial<CommunityFilters>) {
  const [filters, setFilters] = useState<CommunityFilters>({
    ...DEFAULT_FILTERS,
    ...initial,
  });
  const [sort, setSort] = useState<CommunitySort>("score");

  const updateFilter = useCallback(
    <K extends keyof CommunityFilters>(key: K, value: CommunityFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initial });
  }, [initial]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(filters.tradition) ||
      (filters.beginnerFriendly && filters.beginnerFriendly !== "any") ||
      (filters.costRange && filters.costRange !== "any") ||
      (filters.setting && filters.setting !== "any") ||
      Boolean(filters.search?.trim()) ||
      (filters.tags && filters.tags.length > 0)
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    sort,
    setSort,
  };
}
