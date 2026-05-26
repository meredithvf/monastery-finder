/** Supabase select fragment for community rows with profiles and scores. */
export const COMMUNITY_SELECT = `
  *,
  community_profiles ( community_id, profile, last_enriched_at ),
  community_scores (
    community_id,
    overall,
    data_completeness,
    source_quality,
    inference_level,
    adjusted_overall,
    adjusted_data_completeness,
    adjusted_source_quality,
    adjusted_inference_level,
    feature_scores,
    updated_at
  )
`;
