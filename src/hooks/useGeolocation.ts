"use client";

import { useCallback, useState } from "react";

export function useGeolocation() {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setEnabled(true);
      },
      () => {
        setError("Location access was denied or unavailable.");
        setEnabled(false);
      },
      { enableHighAccuracy: false, timeout: 12000 },
    );
  }, []);

  return { coords, enabled, error, request, setEnabled };
}
