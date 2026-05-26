import { NextRequest, NextResponse } from "next/server";
import { runMatchingPipeline } from "@/agents/matching/pipeline";
import type { DiscoveryMatchResponse } from "@/lib/discovery-match";
import { isDiscoveryProfile } from "@/lib/discovery-profile-validation";
import { fetchCommunitiesForDiscoveryMatch } from "@/lib/community-queries";
import { createServerSupabaseClient } from "@/lib/supabase";

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
    const { candidates, listItemById } =
      await fetchCommunitiesForDiscoveryMatch(supabase);
    const pipeline = await runMatchingPipeline(supabase, {
      userProfile: body.profile,
      topN,
      candidates,
    });

    const response: DiscoveryMatchResponse = {
      totalCandidates: pipeline.totalCandidates,
      totalAfterConstraints: pipeline.totalAfterConstraints,
      ranked: pipeline.ranked.map((match) => ({
        ...match,
        community: listItemById.get(match.id) ?? null,
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Discovery match failed:", err);
    return NextResponse.json(
      { error: "Failed to compute matches." },
      { status: 500 },
    );
  }
}
