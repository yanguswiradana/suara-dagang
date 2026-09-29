# SuaraDagang - Arsitektur

> Dokumen hidup. Terakhir diperbarui: 2026-09-29 (setelah MVP live)

## Ringkasan

Web app satu halaman: UMKM isi brief produk → server panggil Gemini → 3
caption + 15 hashtag siap copy. Tanpa auth, tanpa database di MVP.

## Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 App Router | API route = backend, 1 deploy Vercel |
| Styling | Tailwind v4 + CSS variables | theme light/dark via class `dark` |
| AI | Google AI Studio (Gemini REST) | free tier, JSON output |
| State client | React state | hasil hidup di sesi |
| Persistensi | localStorage (browser) | tanpa DB, tanpa auth, MVP |
| Hosting | Vercel | 1 klik, env var untuk API key |

## Alur data

```
[Form client] --POST /api/generate--> [route.ts]
                                        ├─ validasi input (produk + desc wajib)
                                        ├─ cache lookup: sha256(input) → hit = return instan
                                        │    (cache hit TIDAK mengurangi rate limit)
                                        ├─ rate limit: 10x/jam/IP (in-memory)
                                        ├─ Gemini generateContent (gemini-3.5-flash-lite)
                                        │    ├─ sukses → parse JSON
                                        │    └─ gagal + ada foto → retry 1x TANPA foto
                                        ├─ sanitize hashtags (banned filter + paksa lokal)
                                        └─ return {captions, hashtags, cached}
[Client] ←── JSON ── render + push ke localStorage history (cap 20)
```

## Kontrak API

### `POST /api/generate`

Request:
```json
{
  "businessName": "Warung Sari Rasa",
  "product": "Ayam Betutu Frozen 500 gr",
  "description": "...",
  "category": "kuliner | fashion | kerajinan | jasa | umum",
  "tone": "santai | formal | promosi | balivibes",
  "language": "id | en",
  "imageBase64": "data:image/jpeg;base64,..." // opsional
}
```

Response sukses (200):
```json
{
  "captions": [{ "label": "santai", "text": "..." }, ...],
  "hashtags": ["#umkmbali", ...],
  "cached": false
}
```

Error: `400` input tidak valid · `429` rate limit · `502` AI gagal/kosong ·
`500` env key kosong. Selalu `{ "error": "<pesan Indonesia>" }`.

## Modul lib/

| File | Tanggung jawab |
|---|---|
| `gemini.ts` | buildPrompt, callGemini (vision opsional), parseGeminiJson (toleran fence) |
| `hashtags.ts` | banned list, kategori tag lokal Bali, dedupe + pad ke 15 |
| `rate-limit.ts` | sliding window 10/jam per IP (in-memory) |
| `cache.ts` | sha256 hash input → hasil, TTL 24h, cap 200 entries |
| `storage.ts` | brand profile + history di localStorage |

## Batasan yang disengaja (MVP)

- Rate limit & cache in-memory → reset saat cold start serverless. Cukup
  untuk jatah kuota, bukan anti-abuse.
- Tanpa auth → semua persistensi per-perangkat. Database baru setelah V2.
- Sisipan Bahasa Bali = frasa umum pada prompt, bukan terjemahan penuh.

## Env

```
GEMINI_API_KEY=wajib
GEMINI_MODEL=gemini-3.5-flash-lite   # opsional, default saat ini
```
