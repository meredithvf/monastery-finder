import type { CommunityType } from "@/lib/types/community";

export function formatCommunityType(type: CommunityType | string): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
