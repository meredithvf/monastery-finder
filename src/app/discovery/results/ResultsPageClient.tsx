"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DiscoveryProfileSummary } from "@/components/DiscoveryProfileSummary";
import { CommunityMapLazy } from "@/components/communities/CommunityMapLazy";
import { MatchResultCard } from "@/components/communities/MatchResultCard";
import { SiteNav } from "@/components/communities/SiteNav";
import styles from "@/components/communities/communities.module.css";
import btnStyles from "@/styles/buttons.module.css";
import type { DiscoveryMatchResponse } from "@/lib/discovery-match";
import { loadDiscoveryProfile } from "@/lib/discovery-storage";
import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import type { CommunityListItem } from "@/lib/types/community";

export default function ResultsPageClient() {
  const [profile, setProfile] = useState<UserDiscoveryProfile | null>(null);
  const [matchData, setMatchData] = useState<DiscoveryMatchResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadDiscoveryProfile();
    if (!stored) {
      setLoading(false);
      return;
    }
    setProfile(stored);

    async function fetchMatches() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/discovery/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: stored, topN: 25 }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load matches.");
        }
        setMatchData(data as DiscoveryMatchResponse);
        const first = (data as DiscoveryMatchResponse).ranked[0];
        if (first) setSelectedId(first.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load matches.",
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchMatches();
  }, []);

  const mapCommunities = useMemo((): CommunityListItem[] => {
    if (!matchData) return [];
    return matchData.ranked
      .map((m) => m.community)
      .filter(
        (c): c is CommunityListItem =>
          c != null && c.latitude != null && c.longitude != null,
      );
  }, [matchData]);

  if (!loading && !profile) {
    return (
      <div className={styles.shell}>
        <SiteNav />
        <header className={styles.pageHeader}>
          <h1>Your matches</h1>
          <p className={styles.error}>
            No discovery profile found. Complete the chat on the home page
            first.
          </p>
          <Link href="/" className={btnStyles.btn}>
            Start discovery
          </Link>
        </header>
      </div>
    );
  }

  return (
    <div className={`${styles.shell} ${styles.resultsShell}`}>
      <SiteNav />
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderMain}>
          <div className={styles.pageTitleRow}>
            <h1>Your matches</h1>
            {profile && <DiscoveryProfileSummary profile={profile} />}
          </div>
        </div>
      </header>

      <div className={styles.resultsBody}>
        {error && (
          <p className={`${styles.error} ${styles.resultsStatus}`}>{error}</p>
        )}

        {loading && (
          <p className={`${styles.status} ${styles.resultsStatus}`}>
            Finding your best matches…
          </p>
        )}

        {!loading && matchData && matchData.ranked.length === 0 && (
          <p className={`${styles.status} ${styles.resultsStatus}`}>
            No communities matched your filters. Try adjusting region or
            tradition preferences on the home page.
          </p>
        )}

        {!loading && matchData && matchData.ranked.length > 0 && (
          <div className={`${styles.mapLayout} ${styles.resultsMapLayout}`}>
            {mapCommunities.length === 0 ? (
              <p className={styles.resultsMapEmpty}>
                None of your top matches have map coordinates yet.
              </p>
            ) : (
              <CommunityMapLazy
                communities={mapCommunities}
                selectedId={selectedId}
                onSelect={setSelectedId}
                height="100%"
                showPreview={false}
                fitAllOnLoad={false}
              />
            )}
            <aside className={styles.sidebar} aria-label="Ranked matches">
              <p className={styles.sidebarHeading}>Ranked matches</p>
              <div className={styles.matchList}>
                {matchData.ranked.map((match) => (
                  <MatchResultCard
                    key={match.id}
                    match={match}
                    compact
                    selected={match.id === selectedId}
                    onSelect={() => setSelectedId(match.id)}
                  />
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
