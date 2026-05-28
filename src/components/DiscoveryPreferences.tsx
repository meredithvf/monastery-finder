"use client";

import type { DiscoverySliderValues } from "@/lib/discovery-sliders";
import {
  DISCOVERY_SLIDER_GROUPS,
  PROFILE_TITLE_OPTIONS,
  SERIOUSNESS_LEVELS,
  getSliderValue,
  setSliderValue,
} from "@/lib/discovery-sliders";
import type { ProfileTitle } from "@/lib/discovery-profile";
import styles from "./DiscoveryChat.module.css";

export function DiscoveryPreferences({
  values,
  onChange,
}: {
  values: DiscoverySliderValues;
  onChange: (values: DiscoverySliderValues) => void;
}) {
  const seriousness =
    SERIOUSNESS_LEVELS.find((l) => l.value === values.seriousness_level) ??
    SERIOUSNESS_LEVELS[2];

  return (
    <div className={styles.preferences}>
      <div className={styles.preferencesHeader}>
        <p className={styles.profileLabel}>Tune your preferences</p>
        <p className={styles.preferencesHint}>
          Set sliders where your gut leans — neutral is the middle. These shape
          your matches alongside what you shared in the chat.
        </p>
      </div>

      <fieldset className={styles.titleFieldset}>
        <legend className={styles.fieldGroupTitle}>Where are you on the path?</legend>
        <div className={styles.titleOptions}>
          {PROFILE_TITLE_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.titleOption}>
              <input
                type="radio"
                name="profile-title"
                value={opt.value}
                checked={values.title === opt.value}
                onChange={() =>
                  onChange({ ...values, title: opt.value as ProfileTitle })
                }
              />
              <span className={styles.titleOptionLabel}>{opt.value}</span>
              <span className={styles.sliderDescription}>{opt.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {DISCOVERY_SLIDER_GROUPS.map((group) => (
        <div key={group.title} className={styles.sliderGroup}>
          <h4 className={styles.fieldGroupTitle}>{group.title}</h4>
          {group.sliders.map((slider) => {
            const value = getSliderValue(values, slider);
            return (
              <div key={slider.field} className={styles.spectrumRow}>
                <div className={styles.spectrumLabels}>
                  <span>{slider.leftLabel}</span>
                  <span>{slider.rightLabel}</span>
                </div>
                <input
                  type="range"
                  className={styles.spectrumSlider}
                  min={0}
                  max={100}
                  step={1}
                  value={value}
                  aria-valuetext={`${value} — closer to ${value < 50 ? slider.leftLabel : slider.rightLabel}`}
                  onChange={(e) =>
                    onChange(
                      setSliderValue(values, slider, Number(e.target.value)),
                    )
                  }
                />
                <p className={styles.sliderDescription}>{slider.description}</p>
              </div>
            );
          })}
        </div>
      ))}

      <div className={styles.sliderGroup}>
        <h4 className={styles.fieldGroupTitle}>How seriously are you exploring?</h4>
        <div className={styles.spectrumRow}>
          <div className={styles.spectrumLabels}>
            <span>{SERIOUSNESS_LEVELS[0].label}</span>
            <span>{SERIOUSNESS_LEVELS[4].label}</span>
          </div>
          <input
            type="range"
            className={styles.spectrumSlider}
            min={1}
            max={5}
            step={1}
            value={values.seriousness_level}
            aria-valuetext={`${seriousness.label}: ${seriousness.description}`}
            onChange={(e) =>
              onChange({
                ...values,
                seriousness_level: Number(e.target.value),
              })
            }
          />
          <p className={styles.seriousnessCurrent}>
            <strong>{seriousness.label}</strong> — {seriousness.description}
          </p>
        </div>
      </div>
    </div>
  );
}
