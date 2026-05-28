import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityDetailMap } from "./CommunityDetailMap";
import { SiteNav } from "@/components/communities/SiteNav";
import { ScoreBar } from "@/components/communities/ScoreBar";
import { WebsiteContentSections } from "@/components/communities/WebsiteContentSections";
import styles from "@/components/communities/communities.module.css";
import btnStyles from "@/styles/buttons.module.css";
import {
  fetchCommunityById,
  formatLocation,
  toListItem,
} from "@/lib/communities";
import {
  FEATURE_FIELD_LABELS,
  FEATURE_GROUP_LABELS,
  formatBinaryFeature,
  parseFeatureScores,
} from "@/lib/feature-scores";
import { hasWebsiteContent } from "@/lib/website-content";
import { createServerSupabaseClient } from "@/lib/supabase";
import { isUnknownSentinel } from "@/lib/string-utils";
import type {
  CommunityFeatureGroups,
  CommunityFeatureScores,
  CommunityProfileJson,
  CommunityType,
  ScoreUnit,
  StayOption,
  TriState,
} from "@/lib/types/community";

type Props = { params: Promise<{ id: string }> };

const BINARY_FIELDS = new Set([
  "residential_option_available",
  "long_term_residency_supported",
  "guest_stay_supported",
]);

const STAY_OPTION_LABELS: Record<StayOption, string> = {
  retreat: "Retreat",
  short_term: "Short-term stay",
  long_term: "Long-term residency",
  resident: "Resident",
  volunteer: "Volunteer",
};

function formatTriState(value: TriState | undefined): string {
  if (!value || isUnknownSentinel(value)) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatLevel(value: string | undefined): string {
  if (!value || isUnknownSentinel(value)) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCommunityType(type: CommunityType | string): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStudyVsPractice(value: string | undefined): string {
  if (isUnknownSentinel(value)) return "Unknown";
  if (value === "practice-heavy") return "Practice-heavy";
  if (value === "study") return "Study-focused";
  return value!.charAt(0).toUpperCase() + value!.slice(1);
}

function formatCommunityTone(value: string | undefined): string {
  if (isUnknownSentinel(value)) return "Unknown";
  return value!.charAt(0).toUpperCase() + value!.slice(1);
}

function formatHousing(value: string | undefined): string {
  if (isUnknownSentinel(value)) return "Unknown";
  return value!.charAt(0).toUpperCase() + value!.slice(1);
}

function formatStayOptions(options: StayOption[]): string {
  return options
    .map((option) => STAY_OPTION_LABELS[option] ?? option)
    .join(", ");
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
        {Object.entries(features).map(([key, value]) =>
          BINARY_FIELDS.has(key) ? (
            <div key={key} className={styles.scoreItem}>
              <span>{FEATURE_FIELD_LABELS[key] ?? key}</span>
              <strong>{formatBinaryFeature(value as 0 | 1)}</strong>
            </div>
          ) : (
            <ScoreBar
              key={key}
              label={FEATURE_FIELD_LABELS[key] ?? key}
              value={value as ScoreUnit}
            />
          ),
        )}
      </div>
    </div>
  );
}

function EtiquetteBlock({ profile }: { profile: CommunityProfileJson }) {
  const etiquette = profile.display?.etiquette;
  if (!etiquette) return null;

  const items = [
    !isUnknownSentinel(etiquette.dressCode) && {
      label: "Dress code",
      value: etiquette.dressCode!,
    },
    !isUnknownSentinel(etiquette.communicationStyle) && {
      label: "Communication",
      value: etiquette.communicationStyle!,
    },
    !isUnknownSentinel(etiquette.behaviorNotes) && {
      label: "Behavior",
      value: etiquette.behaviorNotes!,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const guidelines = etiquette.guidelines?.trim();

  if (items.length === 0 && !guidelines) return null;

  return (
    <section className={styles.section}>
      <h2>Etiquette</h2>
      {items.map((item) => (
        <p key={item.label}>
          <strong>{item.label}:</strong> {item.value}
        </p>
      ))}
      {guidelines && !isUnknownSentinel(guidelines) && (
        <div className={styles.pageContent} style={{ marginTop: "0.75rem" }}>
          {guidelines.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph.trim()}</p>
          ))}
        </div>
      )}
    </section>
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

  const { community, profile, scores, websiteContent } = data;
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

  const heroImage =
    websiteContent?.primaryImage?.url ?? profile?.display?.imageUrl ?? null;
  const heroImageAlt =
    websiteContent?.primaryImage?.alt?.trim() ||
    profile?.display?.summaryTagline ||
    community.name;

  const showWebsiteSections =
    websiteContent && hasWebsiteContent(websiteContent);

  const profileTypes = profile?.coreIdentity?.types?.length
    ? profile.coreIdentity.types
    : community.types;

  const locationLine = [
    formatLocation(community),
    profile?.geographic?.region && !isUnknownSentinel(profile.geographic.region)
      ? profile.geographic.region
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.shell}>
      <SiteNav />
      <article className={styles.detail}>
        <div className={styles.detailHero}>
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={heroImageAlt}
              className={styles.detailHeroImage}
            />
          )}
          <p className={styles.cardMeta}>
            {[community.tradition, profile?.coreIdentity?.affiliation]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <h1>{community.name}</h1>
          {profileTypes.length > 0 && (
            <div className={styles.cardTags}>
              {profileTypes.map((type) => (
                <span key={type}>{formatCommunityType(type)}</span>
              ))}
            </div>
          )}
          <p className={styles.cardMeta}>{locationLine}</p>
          {profile?.display?.summaryTagline && (
            <p>{profile.display.summaryTagline}</p>
          )}
          {community.website && (
            <a
              href={community.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {community.website}
            </a>
          )}
        </div>

        {showWebsiteSections && (
          <WebsiteContentSections content={websiteContent} />
        )}

        {!showWebsiteSections && profile?.practice?.dailyLife && (
          <section className={styles.section}>
            <h2>Daily life</h2>
            {!isUnknownSentinel(profile.practice.dailyLife.scheduleSummary) && (
              <p>{profile.practice.dailyLife.scheduleSummary}</p>
            )}
            {profile.practice.dailyLife.typicalDay &&
              !isUnknownSentinel(profile.practice.dailyLife.typicalDay) && (
                <p>{profile.practice.dailyLife.typicalDay}</p>
              )}
            {profile.practice.dailyLife.workPractice &&
              !isUnknownSentinel(profile.practice.dailyLife.workPractice) && (
                <p>
                  <strong>Work practice:</strong>{" "}
                  {profile.practice.dailyLife.workPractice}
                </p>
              )}
            {!isUnknownSentinel(profile.practice.dailyLife.silenceLevel) && (
              <p className={styles.cardMeta}>
                Silence: {formatLevel(profile.practice.dailyLife.silenceLevel)}
              </p>
            )}
          </section>
        )}

        {!showWebsiteSections && profile?.practice?.practiceStyle && (
          <section className={styles.section}>
            <h2>Practice style</h2>
            {!isUnknownSentinel(profile.practice.practiceStyle.meditationIntensity) && (
              <p>
                Meditation intensity:{" "}
                {formatLevel(
                  profile.practice.practiceStyle.meditationIntensity,
                )}
              </p>
            )}
            {!isUnknownSentinel(profile.practice.practiceStyle.ritualLevel) && (
              <p>
                Ritual level:{" "}
                {formatLevel(profile.practice.practiceStyle.ritualLevel)}
              </p>
            )}
            {!isUnknownSentinel(profile.practice.practiceStyle.studyVsPractice) && (
              <p>
                Study vs practice:{" "}
                {formatStudyVsPractice(
                  profile.practice.practiceStyle.studyVsPractice,
                )}
              </p>
            )}
            {!isUnknownSentinel(profile.practice.communityAtmosphere.tone) && (
              <p>
                Community tone:{" "}
                {formatCommunityTone(profile.practice.communityAtmosphere.tone)}
                {!isUnknownSentinel(
                  profile.practice.communityAtmosphere.communalityLevel,
                ) && (
                  <>
                    {" "}
                    · Communality:{" "}
                    {formatLevel(
                      profile.practice.communityAtmosphere.communalityLevel,
                    )}
                  </>
                )}
              </p>
            )}
          </section>
        )}

        {profile && <EtiquetteBlock profile={profile} />}

        {(scores || featureScores) && (
          <section className={styles.section}>
            <h2>Scores</h2>
            {scores && (
              <div className={styles.scoreGrid}>
                <ScoreBar
                  label="Overall match"
                  value={scores.adjusted_overall}
                />
                <ScoreBar
                  label="Data completeness"
                  value={scores.adjusted_data_completeness}
                />
                <ScoreBar
                  label="Source quality"
                  value={scores.adjusted_source_quality}
                />
              </div>
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
                <h3
                  className={styles.cardMeta}
                  style={{ marginBottom: "0.5rem" }}
                >
                  Extraction signals
                </h3>
                <div className={styles.scoreGrid}>
                  <ScoreBar
                    label={FEATURE_FIELD_LABELS.extraction_confidence}
                    value={featureScores.signals.extraction_confidence}
                  />
                </div>
                {featureScores.signals.missing_data_fields.length > 0 && (
                  <p
                    className={styles.cardMeta}
                    style={{ marginTop: "0.5rem" }}
                  >
                    Missing:{" "}
                    {featureScores.signals.missing_data_fields.join(", ")}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {profile?.accessibility && (
          <section className={styles.section}>
            <h2>Practical fit</h2>
            <p>
              Beginner friendly:{" "}
              {formatTriState(profile.accessibility.beginnerFriendly)}
            </p>
            {profile.accessibility.englishSupport && (
              <p>
                English support:{" "}
                {formatTriState(profile.accessibility.englishSupport)}
              </p>
            )}
            {profile.accessibility.culturalBarrier && (
              <p>
                Cultural barrier:{" "}
                {formatLevel(profile.accessibility.culturalBarrier)}
              </p>
            )}
            {profile.accessibility.applicationDifficulty && (
              <p>
                Application difficulty:{" "}
                {formatLevel(profile.accessibility.applicationDifficulty)}
              </p>
            )}
            {profile.accessibility.stayFlexibility && (
              <p>
                Stay flexibility:{" "}
                {formatLevel(profile.accessibility.stayFlexibility)}
              </p>
            )}
            <p>
              Cost:{" "}
              {profile.accessibility.logistics.cost.min != null ||
              profile.accessibility.logistics.cost.max != null
                ? `${profile.accessibility.logistics.cost.min ?? "?"} – ${profile.accessibility.logistics.cost.max ?? "?"} ${profile.accessibility.logistics.cost.currency}`
                : "Not specified"}
            </p>
            {profile.accessibility.logistics.stayOptions.length > 0 && (
              <p>
                Stay options:{" "}
                {formatStayOptions(profile.accessibility.logistics.stayOptions)}
              </p>
            )}
            <p>
              Housing:{" "}
              {formatHousing(profile.accessibility.logistics.housingAvailable)}
            </p>
            {!isUnknownSentinel(profile.geographic.ruralUrban) && (
              <p>Setting: {formatLevel(profile.geographic.ruralUrban)}</p>
            )}
            {profile.fitSignals.bestFor.length > 0 && (
              <p>
                <strong>Best for:</strong>{" "}
                {profile.fitSignals.bestFor.join(", ")}
              </p>
            )}
            {profile.fitSignals.notSuitableFor.length > 0 && (
              <p>
                <strong>Not suitable for:</strong>{" "}
                {profile.fitSignals.notSuitableFor.join(", ")}
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

        <Link href="/map" className={btnStyles.btnGhost}>
          ← Back to map
        </Link>
      </article>
    </div>
  );
}
