import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityDetailMap } from "./CommunityDetailMap";
import { SiteNav } from "@/components/communities/SiteNav";
import styles from "@/components/communities/communities.module.css";
import {
  fetchCommunityById,
  formatLocation,
  toListItem,
} from "@/lib/communities";
import {
  FEATURE_FIELD_LABELS,
  FEATURE_GROUP_LABELS,
  formatBinaryFeature,
  formatScorePct,
  parseFeatureScores,
} from "@/lib/feature-scores";
import { createServerSupabaseClient } from "@/lib/supabase";
import type {
  CommunityFeatureGroups,
  CommunityFeatureScores,
  ScoreUnit,
} from "@/lib/types/community";

type Props = { params: Promise<{ id: string }> };

const BINARY_FIELDS = new Set([
  "residential_option_available",
  "long_term_residency_supported",
  "guest_stay_supported",
]);

function pct(n: number | null | undefined): string {
  return formatScorePct(n ?? null);
}

function renderFeatureValue(key: string, value: ScoreUnit | 0 | 1): string {
  if (BINARY_FIELDS.has(key)) {
    return formatBinaryFeature(value as 0 | 1);
  }
  return pct(value as ScoreUnit);
}

function FeatureGroupSection({
  title,
  features,
}: {
  title: string;
  features: Record<string, ScoreUnit | 0 | 1>;
}) {
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <h3 className={styles.cardMeta} style={{ marginBottom: "0.5rem" }}>
        {title}
      </h3>
      <div className={styles.scoreGrid}>
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className={styles.scoreItem}>
            <span>{FEATURE_FIELD_LABELS[key] ?? key}</span>
            <strong>{renderFeatureValue(key, value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `${id.replace(/-/g, " ")} | Monastery Finder`,
  };
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;
  let data;
  try {
    const supabase = createServerSupabaseClient();
    data = await fetchCommunityById(supabase, id);
  } catch {
    notFound();
  }

  if (!data) notFound();

  const { community, profile, scores } = data;
  const listItem = toListItem({
    ...community,
    community_profiles: profile
      ? [{ community_id: community.id, profile, last_enriched_at: "" }]
      : null,
    community_scores: scores,
  });

  const featureScores: CommunityFeatureScores | null = parseFeatureScores(
    scores?.feature_scores,
  );
  const groups = featureScores?.features;

  return (
    <div className={styles.shell}>
      <SiteNav />
      <article className={styles.detail}>
        <div className={styles.detailHero}>
          <p className={styles.cardMeta}>{community.tradition}</p>
          <h1>{community.name}</h1>
          <p className={styles.cardMeta}>
            {formatLocation(community)}
          </p>
          {profile?.display?.summaryTagline && (
            <p>{profile.display.summaryTagline}</p>
          )}
          {community.website && (
            <a href={community.website} target="_blank" rel="noopener noreferrer">
              {community.website}
            </a>
          )}
        </div>

        {profile?.display?.description && (
          <section className={styles.section}>
            <h2>About</h2>
            <p>{profile.display.description}</p>
            {profile.display.tags?.length > 0 && (
              <div className={styles.cardTags}>
                {profile.display.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {profile?.practice?.dailyLife && (
          <section className={styles.section}>
            <h2>Daily life</h2>
            <p>{profile.practice.dailyLife.scheduleSummary}</p>
            {profile.practice.dailyLife.typicalDay && (
              <p>{profile.practice.dailyLife.typicalDay}</p>
            )}
            {profile.practice.dailyLife.workPractice && (
              <p>
                <strong>Work practice:</strong>{" "}
                {profile.practice.dailyLife.workPractice}
              </p>
            )}
            <p className={styles.cardMeta}>
              Silence: {profile.practice.dailyLife.silenceLevel}
            </p>
          </section>
        )}

        {profile?.practice?.practiceStyle && (
          <section className={styles.section}>
            <h2>Practice style</h2>
            <p>
              Meditation intensity:{" "}
              {profile.practice.practiceStyle.meditationIntensity}
            </p>
            <p>
              Ritual level: {profile.practice.practiceStyle.ritualLevel}
            </p>
            <p>
              Study vs practice:{" "}
              {profile.practice.practiceStyle.studyVsPractice}
            </p>
            <p>
              Community tone: {profile.practice.communityAtmosphere.tone} ·
              Communality: {profile.practice.communityAtmosphere.communalityLevel}
            </p>
          </section>
        )}

        {(scores || featureScores) && (
          <section className={styles.section}>
            <h2>Scores</h2>
            {scores && (
              <div className={styles.scoreGrid}>
                <div className={styles.scoreItem}>
                  <span>Overall match</span>
                  <strong>{pct(scores.adjusted_overall)}</strong>
                </div>
                <div className={styles.scoreItem}>
                  <span>Data completeness</span>
                  <strong>{pct(scores.adjusted_data_completeness)}</strong>
                </div>
                <div className={styles.scoreItem}>
                  <span>Source quality</span>
                  <strong>{pct(scores.adjusted_source_quality)}</strong>
                </div>
              </div>
            )}
            {featureScores?.website_summary && (
              <p style={{ marginTop: "0.75rem" }}>
                {featureScores.website_summary}
              </p>
            )}
            {groups &&
              (
                Object.entries(FEATURE_GROUP_LABELS) as Array<
                  [keyof CommunityFeatureGroups, string]
                >
              ).map(([key, label]) => (
                <FeatureGroupSection
                  key={key}
                  title={label}
                  features={groups[key] as Record<string, ScoreUnit | 0 | 1>}
                />
              ))}
            {featureScores?.signals && (
              <div style={{ marginTop: "0.75rem" }}>
                <h3 className={styles.cardMeta} style={{ marginBottom: "0.5rem" }}>
                  Extraction signals
                </h3>
                <div className={styles.scoreGrid}>
                  <div className={styles.scoreItem}>
                    <span>{FEATURE_FIELD_LABELS.extraction_confidence}</span>
                    <strong>
                      {pct(featureScores.signals.extraction_confidence)}
                    </strong>
                  </div>
                </div>
                {featureScores.signals.missing_data_fields.length > 0 && (
                  <p className={styles.cardMeta} style={{ marginTop: "0.5rem" }}>
                    Missing:{" "}
                    {featureScores.signals.missing_data_fields.join(", ")}
                  </p>
                )}
                {featureScores.signals.explicit_quotes.length > 0 && (
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                    {featureScores.signals.explicit_quotes.map((quote) => (
                      <li key={quote}>{quote}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}

        {profile?.accessibility && (
          <section className={styles.section}>
            <h2>Practical fit</h2>
            <p>
              Beginner friendly: {profile.accessibility.beginnerFriendly}
            </p>
            <p>
              Cost:{" "}
              {profile.accessibility.logistics.cost.min != null ||
              profile.accessibility.logistics.cost.max != null
                ? `${profile.accessibility.logistics.cost.min ?? "?"} – ${profile.accessibility.logistics.cost.max ?? "?"} ${profile.accessibility.logistics.cost.currency}`
                : "Not specified"}
            </p>
            <p>Setting: {profile.geographic.ruralUrban}</p>
            {profile.fitSignals.bestFor.length > 0 && (
              <p>
                <strong>Best for:</strong>{" "}
                {profile.fitSignals.bestFor.join(", ")}
              </p>
            )}
          </section>
        )}

        {(listItem.city || listItem.state) && (
          <section className={styles.section}>
            <h2>Location</h2>
            <CommunityDetailMap item={listItem} />
          </section>
        )}

        {profile?.evidence?.sources && profile.evidence.sources.length > 0 && (
          <section className={styles.section}>
            <h2>Sources</h2>
            <div className={styles.sourceList}>
              {profile.evidence.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.type}: {source.url}
                </a>
              ))}
            </div>
          </section>
        )}

        <Link href="/list" className={styles.btnGhost}>
          ← Back to list
        </Link>
      </article>
    </div>
  );
}
