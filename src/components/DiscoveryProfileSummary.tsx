import type { UserDiscoveryProfile } from "@/lib/discovery-profile";
import styles from "@/components/communities/communities.module.css";

/** Profile summary inline beside a page title. */
export function DiscoveryProfileSummary({
  profile,
}: {
  profile: UserDiscoveryProfile;
}) {
  return (
    <p className={styles.profileSummaryInline}>{profile.summary}</p>
  );
}
