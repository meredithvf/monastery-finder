import type { UserDiscoveryProfile } from "@/lib/discovery-profile";

function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Runtime guard for discovery profile payloads from client or API. */
export function isDiscoveryProfile(
  value: unknown,
): value is UserDiscoveryProfile {
  if (!isObject(value)) return false;

  return (
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    isObject(value.spiritual_orientation) &&
    isObject(value.community_structure) &&
    isObject(value.lifestyle) &&
    isObject(value.practical_constraints) &&
    isObject(value.readiness) &&
    typeof value.readiness.primary_intent === "string" &&
    typeof value.readiness.seriousness_level === "number"
  );
}
