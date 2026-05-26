"use client";

import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import styles from "./DiscoveryChat.module.css";

export function DiscoveryProfileView({
  profile,
}: {
  profile: UserDiscoveryProfile;
}) {
  const practical = profile.practical_constraints;
  const practicalEntries = [
    ["Budget", practical.budget],
    ["Visa needs", practical.visa_needs],
    ["Languages", practical.language_support?.join(", ")],
    ["Dietary", practical.dietary_restrictions?.join(", ")],
    ["Accessibility", practical.accessibility_needs?.join(", ")],
    ["Age", practical.age_considerations],
    ["Family", practical.family_friendliness],
    ["Region", practical.region],
    ["Tradition", practical.tradition],
  ].filter(([, v]) => v && String(v).trim().length > 0);

  return (
    <div className={styles.profile}>
      <p className={styles.profileLabel}>Your discovery profile</p>
      <h3 className={styles.profileTitle}>{profile.title}</h3>
      <p className={styles.profileSummary}>{profile.summary}</p>

      {practicalEntries.length > 0 && (
        <div className={styles.profileSection}>
          <h4>Practical notes</h4>
          <ul className={styles.practicalList}>
            {practicalEntries.map(([label, value]) => (
              <li key={label}>
                <strong>{label}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(profile.readiness.primary_intent || profile.readiness.notes) && (
        <div className={styles.profileSection}>
          <h4>Readiness</h4>
          {profile.readiness.primary_intent && (
            <p>{profile.readiness.primary_intent}</p>
          )}
          {profile.readiness.notes && <p>{profile.readiness.notes}</p>}
        </div>
      )}
    </div>
  );
}
