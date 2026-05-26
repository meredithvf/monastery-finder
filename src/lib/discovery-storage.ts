import type { UserDiscoveryProfile } from "@/lib/discovery-profile";

const STORAGE_KEY = "monastery-finder-discovery-profile";

export function saveDiscoveryProfile(profile: UserDiscoveryProfile): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadDiscoveryProfile(): UserDiscoveryProfile | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserDiscoveryProfile;
  } catch {
    return null;
  }
}

export function clearDiscoveryProfile(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
