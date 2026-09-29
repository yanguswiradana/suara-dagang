// Banned / spammy hashtags that add no value. AI output is filtered
// against this list (heuristic, not algorithm-aware - see README).
const BANNED = new Set(
  [
    "love",
    "instagood",
    "photooftheday",
    "beautiful",
    "happy",
    "cute",
    "like4like",
    "follow4follow",
    "follow",
    "likeforlike",
    "instalike",
    "igers",
    "viral",
    "trending",
    "explore",
    "fyp",
    "tiktok",
  ].map((t) => t.toLowerCase())
);

// Local Bali / UMKM tags, grouped by category. At least 3 of these are
// forced into every result set.
const LOCAL_TAGS: Record<string, string[]> = {
  umum: ["umkmbali", "belilokal", "dukungumkm", "madeinbali", "bangga lokal"],
  kuliner: [
    "kulinerbali",
    "makananenakbali",
    "jajanbali",
    "kulinerdenpasar",
    "bali foodie",
  ],
  fashion: [
    "fashionbali",
    "oleholehbali",
    "ootdbali",
    "brandlokalbali",
    "belanjabali",
  ],
  kerajinan: [
    "kerajinanbali",
    "handmadebali",
    "souvenirbali",
    "senibali",
    "craftbali",
  ],
  jasa: ["jasabali", "layananjasa", "bali service", "vendorbali", "infobali"],
};

function normalize(tag: string): string {
  return tag
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** Clean AI hashtag output: dedupe, drop banned, force local tags, pad to 15. */
export function sanitizeHashtags(
  aiTags: string[],
  category: string
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of aiTags) {
    const t = normalize(raw);
    if (!t || t.length > 40 || BANNED.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }

  // Force at least 3 local tags for the category (fallback: umum).
  const local = LOCAL_TAGS[category] ?? LOCAL_TAGS.umum;
  const generic = LOCAL_TAGS.umum;
  let localCount = out.filter(
    (t) => local.includes(t) || generic.includes(t)
  ).length;
  for (const t of [...local, ...generic]) {
    if (localCount >= 3) break;
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
      localCount++;
    }
  }

  // Pad to 15 from the local pool so the set is never short.
  for (const t of [...local, ...generic]) {
    if (out.length >= 15) break;
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }

  return out.slice(0, 15).map((t) => `#${t}`);
}
