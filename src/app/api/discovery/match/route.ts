import { NextRequest, NextResponse } from "next/server";
import { runMatchingPipeline } from "@/agents/matching/pipeline";
import type { DiscoveryMatchResponse } from "@/lib/discovery-match";
import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import { fetchCommunities } from "@/lib/communities";
import { createServerSupabaseClient } from "@/lib/supabase";

function isDiscoveryProfile(value: unknown): value is UserDiscoveryProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as UserDiscoveryProfile;
  return (
    typeof p.title === "string" &&
    typeof p.summary === "string" &&
    p.spiritual_orientation != null &&
    p.community_structure != null &&
    p.lifestyle != null &&
    p.readiness != null
  );
}

export async function POST(request: NextRequest) {
  let body: { profile?: unknown; topN?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isDiscoveryProfile(body.profile)) {
    return NextResponse.json(
      { error: "A valid discovery profile is required." },
      { status: 400 },
    );
  }

  const topN =
    typeof body.topN === "number" && body.topN > 0
      ? Math.min(Math.floor(body.topN), 100)
      : 25;

  try {
    const supabase = createServerSupabaseClient();
    const [pipeline, communities] = await Promise.all([
      runMatchingPipeline(supabase, { userProfile: body.profile, topN }),
      fetchCommunities(supabase),
    ]);

    const byId = new Map(communities.map((c) => [c.id, c]));
    const response: DiscoveryMatchResponse = {
      totalCandidates: pipeline.totalCandidates,
      totalAfterConstraints: pipeline.totalAfterConstraints,
      ranked: pipeline.ranked.map((match) => ({
        ...match,
        community: byId.get(match.id) ?? null,
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to compute matches.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
