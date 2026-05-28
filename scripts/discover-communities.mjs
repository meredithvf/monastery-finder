import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

/**
 * Batch discovery script for new communities in the United States.
 *
 * Uses the OpenAI API to propose communities (monasteries, retreat centers, etc.)
 * and inserts any missing ones into the Supabase `communities` table. Dedupes by
 * normalized website domain.
 *
 * Environment variables required:
 * - OPENAI_API_KEY
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY  (service role key; DO NOT expose client-side)
 *
 * Optional:
 * - DISCOVER_MODEL          (default: gpt-4.1-mini)
 * - DISCOVER_MAX_CONTINUATIONS per query (default: 2 extra "find more" passes)
 *
 * Run with:
 *   node scripts/discover-communities.mjs
 */

const REQUIRED_ENV = [
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const MODEL = process.env.DISCOVER_MODEL ?? "gpt-4.1-mini";
const MAX_CONTINUATIONS = Number(process.env.DISCOVER_MAX_CONTINUATIONS ?? 2);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

function normalizeWebsite(website) {
  if (!website) return null;
  try {
    const url = new URL(
      website.startsWith("http") ? website : `https://${website}`,
    );
    let host = url.hostname.toLowerCase();
    host = host.replace(/^www\./, "");
    return host;
  } catch {
    return website.trim().toLowerCase();
  }
}

function isUnitedStates(country) {
  if (!country) return true;
  const c = country.trim().toUpperCase();
  return c === "US" || c === "USA" || c === "UNITED STATES";
}

async function loadExistingWebsiteHosts() {
  const existingHosts = new Set();

  const { data, error } = await supabase
    .from("communities")
    .select("id, website");

  if (error) {
    throw new Error(`Failed to load existing communities: ${error.message}`);
  }

  for (const row of data ?? []) {
    const host = normalizeWebsite(row.website);
    if (host) existingHosts.add(host);
  }

  return existingHosts;
}

/** US Census regions — one API call per (region × category) for broader coverage. */
const US_REGIONS = [
  {
    id: "northeast",
    label:
      "Northeast United States (Maine, New Hampshire, Vermont, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania)",
  },
  {
    id: "southeast",
    label:
      "Southeast United States (Maryland, Delaware, Virginia, West Virginia, North Carolina, South Carolina, Georgia, Florida, Kentucky, Tennessee, Alabama, Mississippi, Arkansas, Louisiana)",
  },
  {
    id: "midwest",
    label:
      "Midwest United States (Ohio, Michigan, Indiana, Illinois, Wisconsin, Minnesota, Iowa, Missouri, North Dakota, South Dakota, Nebraska, Kansas)",
  },
  {
    id: "southwest",
    label:
      "Southwest United States (Texas, Oklahoma, New Mexico, Arizona)",
  },
  {
    id: "mountain",
    label:
      "Mountain United States (Montana, Idaho, Wyoming, Colorado, Utah, Nevada)",
  },
  {
    id: "west",
    label:
      "West United States (Washington, Oregon, California, Alaska, Hawaii)",
  },
];

const DISCOVERY_CATEGORIES = [
  {
    id: "zen",
    description:
      "Zen Buddhist monasteries, zendos, and residential practice centers",
  },
  {
    id: "buddhist_non_zen",
    description:
      "non-Zen Buddhist monasteries and practice centers (Theravada, Mahayana, Tibetan, Pure Land, etc.)",
  },
  {
    id: "catholic_monastery",
    description:
      "Catholic monasteries, abbeys, priories, and convents that host retreats or guest stays",
  },
  {
    id: "benedictine_trappist",
    description:
      "Benedictine, Cistercian, and Trappist monasteries in the United States",
  },
  {
    id: "christian_retreat",
    description:
      "Christian retreat centers (Protestant, Catholic, ecumenical) with contemplative, silent, or directed retreats",
  },
  {
    id: "orthodox",
    description:
      "Eastern Orthodox monasteries and sketes in the United States",
  },
  {
    id: "interfaith_contemplative",
    description:
      "interfaith, ecumenical, or non-denominational contemplative retreat centers",
  },
  {
    id: "intentional_community",
    description:
      "intentional spiritual communities with residential or long-term guest programs (not short event-only venues)",
  },
];

function buildSeedQueries() {
  const queries = [];
  for (const region of US_REGIONS) {
    for (const category of DISCOVERY_CATEGORIES) {
      queries.push({
        id: `${region.id}__${category.id}`,
        text: `${category.description} in the ${region.label}`,
      });
    }
  }
  return queries;
}

const SEED_QUERIES = buildSeedQueries();

const COMMUNITY_LIST_SCHEMA = {
  name: "community_list",
  schema: {
    type: "object",
    properties: {
      communities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            website: { type: "string" },
            tradition: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            country: { type: "string" },
            types: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "name",
            "website",
            "tradition",
            "city",
            "state",
            "country",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["communities"],
    additionalProperties: false,
  },
  strict: true,
};

function buildPrompts(query, excludeNames = []) {
  const systemPrompt =
    "You are building a comprehensive directory of contemplative communities, monasteries, and retreat centers located in the United States only. " +
    "Return only real places with a physical location in the US that operate an on-site residential community and/or recurring multi-day retreats. " +
    "Exclude: one-off event spaces, yoga studios without residential programs, directories, and places outside the United States. " +
    "Be exhaustive: list every qualifying place you know of for the given scope, including smaller and lesser-known communities. " +
    "Do not artificially limit the count — include as many distinct communities as you can.";

  let userPrompt =
    `Find as many distinct communities as possible that match this scope:\n\n` +
    `${query}\n\n` +
    "Requirements:\n" +
    "- United States locations only (country must be US or United States)\n" +
    "- Include name, main website URL, city, US state (2-letter abbreviation preferred), country, and tradition label\n" +
    "- Tradition examples: 'Catholic - Benedictine', 'Catholic - Trappist', 'Christian - Ecumenical retreat', 'Zen', 'Theravada', 'Tibetan', 'Orthodox', 'Interfaith retreat center'\n" +
    "- types: use values like monastery, zen_center, temple, convent, abbey, retreat_center, intentional_community, other when applicable\n" +
    "- Prefer places with an official website; skip if you cannot identify a website\n" +
    "- Aim for completeness within this geographic and thematic scope — not a 'top 10' sample\n";

  if (excludeNames.length > 0) {
    const sample = excludeNames.slice(0, 80);
    userPrompt +=
      `\n\nDo NOT repeat any of these communities already listed (by name or website):\n` +
      sample.map((n) => `- ${n}`).join("\n");
    if (excludeNames.length > sample.length) {
      userPrompt += `\n(...and ${excludeNames.length - sample.length} more already listed)`;
    }
    userPrompt +=
      "\n\nList additional distinct US communities in the same scope that were not included above.";
  }

  return { systemPrompt, userPrompt };
}

async function callOpenAI(systemPrompt, userPrompt) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 16384,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: COMMUNITY_LIST_SCHEMA,
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response did not contain expected text content");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error(
      `Failed to parse OpenAI JSON: ${(err && err.message) || err}`,
    );
  }

  return (parsed.communities ?? []).map((c) => ({
    ...c,
    website: c.website?.trim(),
    country: "US",
  }));
}

async function generateCommunitiesForQuery(queryDef) {
  const collected = [];
  const seenNames = new Set();

  const addBatch = (batch) => {
    for (const c of batch) {
      if (!isUnitedStates(c.country)) continue;
      const key = c.name?.trim().toLowerCase();
      if (!key || seenNames.has(key)) continue;
      seenNames.add(key);
      collected.push(c);
    }
  };

  let excludeNames = [];

  for (let pass = 0; pass <= MAX_CONTINUATIONS; pass++) {
    const { systemPrompt, userPrompt } = buildPrompts(
      queryDef.text,
      pass === 0 ? [] : excludeNames,
    );
    const batch = await callOpenAI(systemPrompt, userPrompt);
    const before = collected.length;
    addBatch(batch);

    if (pass > 0 && collected.length === before) {
      break;
    }

    excludeNames = collected.map((c) => c.name);
    if (batch.length < 5) {
      break;
    }
  }

  return collected;
}

async function upsertCommunities(candidates, existingHosts) {
  const rowsToInsert = [];

  for (const c of candidates) {
    if (!isUnitedStates(c.country)) continue;

    const host = normalizeWebsite(c.website);
    if (!host) continue;
    if (existingHosts.has(host)) continue;

    existingHosts.add(host);

    rowsToInsert.push({
      name: c.name,
      website: c.website,
      tradition: c.tradition,
      types:
        c.types && Array.isArray(c.types) && c.types.length > 0
          ? c.types
          : ["retreat_center"],
      city: c.city,
      state: c.state,
      country: "US",
      latitude: null,
      longitude: null,
    });
  }

  if (rowsToInsert.length === 0) {
    console.log("No new communities to insert.");
    return { inserted: 0 };
  }

  const { data, error } = await supabase
    .from("communities")
    .insert(rowsToInsert)
    .select("id, website");

  if (error) {
    throw new Error(`Failed to insert communities: ${error.message}`);
  }

  console.log(`Inserted ${data.length} new communities.`);
  return { inserted: data.length };
}

async function main() {
  console.log(`Discovery model: ${MODEL}`);
  console.log(`Seed queries: ${SEED_QUERIES.length} (US regions × categories)`);
  console.log(`Max continuation passes per query: ${MAX_CONTINUATIONS}`);

  console.log("\nLoading existing communities from Supabase...");
  const existingHosts = await loadExistingWebsiteHosts();
  console.log(`Loaded ${existingHosts.size} existing website hosts.`);

  const allCandidates = [];
  let queryIndex = 0;

  for (const queryDef of SEED_QUERIES) {
    queryIndex += 1;
    console.log(
      `\n=== [${queryIndex}/${SEED_QUERIES.length}] ${queryDef.id} ===`,
    );
    console.log(queryDef.text);
    try {
      const communities = await generateCommunitiesForQuery(queryDef);
      console.log(`Got ${communities.length} US candidates.`);
      allCandidates.push(...communities);
    } catch (err) {
      console.error(`Failed for query "${queryDef.id}":`, err);
    }
  }

  const uniqueHosts = new Set(
    allCandidates
      .map((c) => normalizeWebsite(c.website))
      .filter(Boolean),
  );
  console.log(
    `\nTotal raw candidates: ${allCandidates.length} (${uniqueHosts.size} unique websites)`,
  );

  try {
    const { inserted } = await upsertCommunities(allCandidates, existingHosts);
    console.log(`Done. Inserted ${inserted} new communities.`);
  } catch (err) {
    console.error("Insert step failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error in discovery script:", err);
  process.exit(1);
});
