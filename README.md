# SuaraDagang

Caption + hashtag siap posting untuk UMKM. Isi form, generate via AI,
salin, posting. Deadline MVP: 2026-10-01.

## Stack

- Next.js 15 App Router + Tailwind v4 (deploy Vercel)
- AI: Google AI Studio (Gemini) via REST, 1 request = 3 caption + 15 hashtag
- Storage MVP: React state (sementara) - auto-save ke localStorage.
  Tanpa database (alasan di bawah).

## Storage: kenapa localStorage, bukan database?

1. Vercel serverless tidak punya filesystem persisten.
2. Tanpa auth, baris database jadi yatim (tidak bisa dipisah per user).
3. History + brand profile itu data per-perangkat yang pas di localStorage.
4. Setup DB (provision, schema, env, latency) memakan jam deadline.

Pindah ke database (Neon/Supabase) HANYA saat V2 butuh auth:
saat itu migrasi history lokal ke tabel per-user.

## Alur data

1. Form submit - validasi client (produk + deskripsi wajib).
2. `POST /api/generate`: rate limit 10x/jam/IP - cek cache hash input
   (hit = respons instan, tanpa AI call) - panggil Gemini.
3. Jika request bawa foto dan AI gagal: retry 1x otomatis TANPA foto
   (jalur teks selalu jalan, sesuai scope terkunci).
4. Hashtag AI dibersihkan: dedupe, buang banned list, paksa min 3 tag
   lokal Bali, pad ke 15.
5. Hasil tampil - auto-save ke history localStorage (maks 30).

## Setup lokal

```bash
npm install
cp .env.example .env.local   # isi GEMINI_API_KEY dari Google AI Studio
npm run dev
```

Deploy Vercel: import repo, tambah env `GEMINI_API_KEY` (+ opsional
`GEMINI_MODEL`), deploy.

## Keterbatasan jujur (untuk README/demo)

- Skor hashtag itu heuristik (campuran broad/mid/lokal + banned-filter),
  BUKAN pengetahuan algoritma Instagram.
- Tone dirancang dari pola umum caption jualan, bukan riset terukur.
- Sisipan Bahasa Bali = frasa umum, bukan terjemahan penuh tervalidasi.
- Rate limit + cache in-memory: reset saat serverless cold start.

## Acceptance criteria MVP

- [ ] Isi produk + deskripsi + kategori - hasil <15 detik
- [ ] 3 caption + 15 hashtag tampil, tombol salin bekerja
- [ ] History survive refresh
- [ ] Kuota/AI gagal: pesan jelas + tombol coba lagi, app tetap usable

## Roadmap (bukan MVP)

Auth, database, scheduling posting, tracking performa, team workspace,
API publik.
