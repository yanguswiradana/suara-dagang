import { NextRequest, NextResponse } from "next/server";
import {
  buildPrompt,
  callGemini,
  parseGeminiJson,
  type GenerateInput,
} from "@/lib/gemini";
import { sanitizeHashtags } from "@/lib/hashtags";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCache, hashInput, setCache } from "@/lib/cache";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (GEMINI_API_KEY kosong)." },
      { status: 500 }
    );
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  let body: GenerateInput & { imageBase64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const { businessName, product, description, category, tone, language, imageBase64 } = body;
  if (!product?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "Nama produk dan deskripsi wajib diisi." },
      { status: 400 }
    );
  }

  const input: GenerateInput = {
    businessName: businessName?.trim() || "-",
    product: product.trim(),
    description: description.trim(),
    category: category || "umum",
    tone: tone || "santai",
    language: language || "id",
  };

  // Cache before rate limit: identical input costs nothing, so it must not
  // consume the user's quota.
  const cacheKey = hashInput({ ...input, hasImage: !!imageBase64 });
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ ...(cached as object), cached: true });
  }

  // Rate limit only actual AI calls.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Batas generate tercapai (10x/jam). Coba lagi dalam ${Math.ceil(
          limit.retryAfterSec / 60
        )} menit.`,
      },
      { status: 429 }
    );
  }

  const prompt = buildPrompt(input);
  let raw: string;
  try {
    raw = await callGemini(apiKey, model, prompt, imageBase64);
  } catch (e) {
    const detail = e instanceof Error ? e.message : "unknown";
    // Fallback: retry once WITHOUT the image (text-only path always works).
    if (!imageBase64) {
      return NextResponse.json(
        { error: `AI gagal [${model}]: ${detail}` },
        { status: 502 }
      );
    }
    try {
      raw = await callGemini(apiKey, model, prompt);
    } catch (e2) {
      const detail2 = e2 instanceof Error ? e2.message : "unknown";
      return NextResponse.json(
        { error: `AI gagal [${model}]: ${detail2}` },
        { status: 502 }
      );
    }
  }

  let parsed;
  try {
    parsed = parseGeminiJson(raw);
  } catch {
    return NextResponse.json(
      { error: "Gagal membaca hasil AI. Coba lagi." },
      { status: 502 }
    );
  }

  const result = {
    captions: parsed.captions,
    hashtags: sanitizeHashtags(parsed.hashtags, input.category),
    cached: false,
  };
  setCache(cacheKey, result);
  return NextResponse.json(result);
}
