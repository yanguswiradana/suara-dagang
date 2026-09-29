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

export function buildPrompt(input: GenerateInput): string {
  const lang = input.language === "en" ? "English" : "Bahasa Indonesia";
  return `You are a copywriter for Indonesian UMKM on Instagram.
Business: "${input.businessName}" | Category: ${input.category}
Product: "${input.product}"
Description: "${input.description}"

Write ALL output in ${lang}. Produce EXACTLY 3 captions with distinct angles:
1. santai - ${TONE_GUIDE.santai}
2. formal - ${TONE_GUIDE.formal}
3. promosi - ${TONE_GUIDE.promosi}
${input.tone === "balivibes" ? `Apply the Bali vibes style ON TOP of each angle: ${TONE_GUIDE.balivibes}` : ""}

Each caption: 60-120 words, ends with a call-to-action (order / DM / visit).
Then suggest EXACTLY 15 hashtags: mix of 5 broad, 5 medium-niche, 5 Bali-local
(e.g. umkmbali, kulinerbali, oleholehbali). No banned/spam tags
(love, instagood, like4like, follow4follow, viral, fyp).

Respond with ONLY valid JSON, no markdown fences:
{"captions":[{"label":"santai","text":"..."},{"label":"formal","text":"..."},{"label":"promosi","text":"..."}],"hashtags":["..."]}`;
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
