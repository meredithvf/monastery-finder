import type {
  CommunityProfileJson,
  CommunityWebsiteContent,
  WebsiteContentField,
  WebsiteContentSection,
  WebsitePrimaryImage,
} from "@/lib/types/community";
import { WEBSITE_CONTENT_FIELDS } from "@/lib/types/community";

export const WEBSITE_CONTENT_LABELS: Record<WebsiteContentField, string> = {
  homepage: "Homepage",
  about: "About",
  retreats: "Retreats",
  programs: "Programs & training",
  guidelines: "Guidelines & etiquette",
  pricing: "Pricing & donations",
  schedule: "Schedule & daily routine",
  residency: "Residency & volunteering",
  visitorInfo: "Visitor information",
};

function normalizeSection(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") return null;
  return trimmed;
}

function sectionFromText(text: string | null | undefined): WebsiteContentSection | null {
  const normalized = normalizeSection(text);
  if (!normalized) return null;
  return { content: normalized };
}

function legacySectionsFromProfile(
  profile: CommunityProfileJson & {
    websiteSections?: Record<string, unknown>;
    practicalFit?: Record<string, unknown>;
    websiteContent?: unknown;
  },
): Partial<Record<WebsiteContentField, string | null>> {
  const fromBlob =
    profile.websiteSections ?? profile.practicalFit ?? profile.websiteContent;
  if (!fromBlob || typeof fromBlob !== "object") return {};

  const raw = fromBlob as Record<string, unknown>;
  const out: Partial<Record<WebsiteContentField, string | null>> = {};
  for (const field of WEBSITE_CONTENT_FIELDS) {
    out[field] = normalizeSection(raw[field]);
  }
  return out;
}

/** Flat website summaries assembled from unified profile fields. */
export function extractWebsiteSummaries(
  profile: CommunityProfileJson,
): Record<WebsiteContentField, string | null> {
  const legacy = legacySectionsFromProfile(
    profile as CommunityProfileJson & {
      websiteSections?: Record<string, unknown>;
      practicalFit?: Record<string, unknown>;
      websiteContent?: unknown;
    },
  );

  const scheduleFromPractice = normalizeSection(
    profile.practice.dailyLife.scheduleSummary,
  );

  return {
    homepage: normalizeSection(profile.display.homepage) ?? legacy.homepage ?? null,
    about: normalizeSection(profile.display.about) ?? legacy.about ?? null,
    retreats:
      normalizeSection(profile.accessibility.retreats) ?? legacy.retreats ?? null,
    programs:
      normalizeSection(profile.accessibility.programs) ?? legacy.programs ?? null,
    guidelines:
      normalizeSection(profile.display.etiquette?.guidelines) ??
      legacy.guidelines ??
      null,
    pricing:
      normalizeSection(profile.accessibility.pricing) ?? legacy.pricing ?? null,
    schedule: legacy.schedule ?? scheduleFromPractice,
    residency:
      normalizeSection(profile.accessibility.residency) ?? legacy.residency ?? null,
    visitorInfo:
      normalizeSection(profile.accessibility.visitorInfo) ??
      legacy.visitorInfo ??
      null,
  };
}

function primaryImageFromProfile(
  profile: CommunityProfileJson,
): WebsitePrimaryImage | undefined {
  const url = profile.display.imageUrl?.trim();
  if (!url) return undefined;
  return {
    url,
    alt: profile.display.summaryTagline?.trim() || profile.coreIdentity.name,
  };
}

function emptyWebsiteContent(): CommunityWebsiteContent {
  return {
    homepage: null,
    about: null,
    retreats: null,
    programs: null,
    guidelines: null,
    pricing: null,
    schedule: null,
    residency: null,
    visitorInfo: null,
  };
}

export function buildWebsiteContentFromProfile(
  profile: CommunityProfileJson,
): CommunityWebsiteContent {
  const content = emptyWebsiteContent();
  const summaries = extractWebsiteSummaries(profile);

  for (const field of WEBSITE_CONTENT_FIELDS) {
    content[field] = sectionFromText(summaries[field]);
  }

  const primaryImage = primaryImageFromProfile(profile);
  if (primaryImage) content.primaryImage = primaryImage;

  return content;
}

export function hasWebsiteContent(
  content: CommunityWebsiteContent | null | undefined,
): boolean {
  if (!content) return false;
  return WEBSITE_CONTENT_FIELDS.some((field) => content[field] != null);
}

export function resolveWebsiteContent(
  profile: CommunityProfileJson | null,
): CommunityWebsiteContent | null {
  if (!profile) return null;
  const built = buildWebsiteContentFromProfile(profile);
  return hasWebsiteContent(built) ? built : null;
}

export function getSectionForField(
  content: CommunityWebsiteContent,
  field: WebsiteContentField,
): WebsiteContentSection | null {
  return content[field];
}
