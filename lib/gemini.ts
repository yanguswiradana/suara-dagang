export interface GenerateInput {
  businessName: string;
  product: string;
  description: string;
  category: string; // kuliner | fashion | kerajinan | jasa | umum
  tone: string; // santai | formal | promosi | balivibes
  language: string; // id | en
}

const TONE_GUIDE: Record<string, string> = {
  santai:
    "Casual and friendly: greetings, light emojis (max 5), everyday words.",
  formal:
    "Professional and informative: complete product info, polite, minimal emojis (max 2).",
  promosi:
    "Persuasive selling: urgency, promo angle, strong call-to-action, CTA at the end.",
  balivibes:
    "Warm Balinese flavor: insert 1-2 natural Balinese phrases (e.g. Rahajeng, Matur Suksma, Dumogi) without overdoing it, friendly selling tone.",
};

// 3 distinct angles WITHIN each selected tone. The user picks ONE tone;
// we return 3 variants of it, not 3 different tones.
const TONE_VARIANTS: Record<string, { label: string; guide: string }[]> = {
  santai: [
    { label: "santai-casual", guide: "chatty, like texting a friend about the product" },
    { label: "santai-humoris", guide: "playful, light joke or pun related to the product" },
    { label: "santai-story", guide: "warm relatable daily scene where the product fits naturally" },
  ],
  formal: [
    { label: "formal-informatif", guide: "complete product facts: ingredients/materials, size, price, shelf life" },
    { label: "formal-singkat", guide: "concise and business-like, no filler words" },
    { label: "formal-premium", guide: "polite upscale positioning, emphasizes quality and trust" },
  ],
  promosi: [
    { label: "promosi-urgensi", guide: "limited stock / act-now framing with strong CTA" },
    { label: "promosi-harga", guide: "price-focused value angle (e.g. 'worth it', compare benefits)" },
    { label: "promosi-hype", guide: "excited launch energy, exclamation, emoji-forward" },
  ],
  balivibes: [
    { label: "balivibes-santai", guide: "casual chat with natural Balinese greeting words" },
    { label: "balivibes-komunitas", guide: "warm neighborly / banjar family feeling" },
    { label: "balivibes-promo", guide: "festive local promo angle, proudly Balinese" },
  ],
};

export function buildPrompt(input: GenerateInput): string {
  const lang = input.language === "en" ? "English" : "Bahasa Indonesia";
  const tone = input.tone in TONE_VARIANTS ? input.tone : "santai";
  const variants = TONE_VARIANTS[tone];
  const variantLines = variants
    .map((v, i) => `${i + 1}. ${v.label} - ${v.guide}`)
    .join("\n");
  return `You are a copywriter for Indonesian UMKM on Instagram.
Business: "${input.businessName}" | Category: ${input.category}
Product: "${input.product}"
Description: "${input.description}"

Selected tone: ${tone.toUpperCase()} - ${TONE_GUIDE[tone]}

Write ALL output in ${lang}. Produce EXACTLY 3 captions in THIS SAME TONE, each a distinct angle:
${variantLines}

Each caption: 60-120 words, ends with a call-to-action (order / DM / visit), and must match the selected tone above.
Then suggest EXACTLY 15 hashtags: mix of 5 broad, 5 medium-niche, 5 Bali-local
(e.g. umkmbali, kulinerbali, oleholehbali). No banned/spam tags
(love, instagood, like4like, follow4follow, viral, fyp).

Respond with ONLY valid JSON, no markdown fences, labels EXACTLY as given above:
{"captions":[{"label":"${variants[0].label}","text":"..."},{"label":"${variants[1].label}","text":"..."},{"label":"${variants[2].label}","text":"..."}],"hashtags":["..."]}`;
}

export interface GeminiResult {
  captions: { label: string; text: string }[];
  hashtags: string[];
}

export async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  imageBase64?: string
): Promise<string> {
  const parts: object[] = [{ text: prompt }];
  if (imageBase64) {
    const [meta, data] = imageBase64.split(",", 2);
    const mimeType = meta.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
    parts.unshift({ inline_data: { mime_type: mimeType, data } });
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini_http_${res.status}`);
  const json = await res.json();
  const text: string | undefined =
    json.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? undefined;
  if (!text) throw new Error("gemini_empty_response");
  return text;
}

/** Extract JSON from model output (tolerates markdown fences). */
export function parseGeminiJson(raw: string): GeminiResult {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("gemini_bad_json");
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed.captions) || !Array.isArray(parsed.hashtags)) {
    throw new Error("gemini_bad_shape");
  }
  return {
    captions: parsed.captions.slice(0, 3).map((c: unknown) => {
      const o = c as { label?: string; text?: string };
      return { label: String(o.label ?? ""), text: String(o.text ?? "") };
    }),
    hashtags: parsed.hashtags.map((h: unknown) => String(h)),
  };
}
