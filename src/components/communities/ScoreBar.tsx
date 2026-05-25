import styles from "./communities.module.css";

type ScoreBarProps = {
  label: string;
  value: number | null | undefined;
};

export function ScoreBar({ label, value }: ScoreBarProps) {
  const pct = value != null ? Math.round(value * 100) : null;
  const fillWidth = pct != null ? `${pct}%` : "0%";

  return (
    <div className={styles.scoreBarItem}>
      <span className={styles.scoreBarLabel}>{label}</span>
      <div
        className={styles.scoreBarTrack}
        role="progressbar"
        aria-valuenow={pct ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        aria-valuetext={
          pct != null ? `${pct} percent` : "No data"
        }
      >
        <div className={styles.scoreBarFill} style={{ width: fillWidth }} />
      </div>
    </div>
  );
}
