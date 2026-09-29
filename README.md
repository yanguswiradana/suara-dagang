# SuaraDagang

Caption + hashtag siap posting untuk UMKM Bali. Isi form, generate via AI,
salin, posting. **MVP selesai 2026-09-29**, deadline 2026-10-01.

**Live:** https://suara-dagang.vercel.app

## Stack

- Next.js 15 App Router + Tailwind v4 (deploy Vercel)
- AI: Google AI Studio (Gemini REST), model `gemini-3.5-flash-lite`
- Storage MVP: React state (sementara) - auto-save ke localStorage.
  Tanpa database (alasan di bawah).
- Desain: editorial workspace - Fraunces / Space Grotesk / IBM Plex Mono,
  light + dark mode, token lengkap di `docs/DESIGN.md`

## Storage: kenapa localStorage, bukan database?

1. Vercel serverless tidak punya filesystem persisten.
2. Tanpa auth, baris database jadi yatim (tidak bisa dipisah per user).
3. History + brand profile itu data per-perangkat yang pas di localStorage.
4. Setup DB (provision, schema, env, latency) memakan jam deadline.

Pindah ke database (Neon/Supabase) HANYA saat V2 butuh auth:
saat itu migrasi history lokal ke tabel per-user.

## Alur data

1. Form submit - validasi client (produk + deskripsi wajib).
2. `POST /api/generate`: validasi - cek cache hash input (hit = instan,
   TANPA mengurangi kuota) - rate limit 10x/jam/IP - panggil Gemini.
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

Catatan: `next build` bisa gagal (Bus Error) di Docker overlay tertentu -
build di host atau di Vercel, bukan di container.

## Keterbatasan jujur (untuk demo)

- Skor hashtag itu heuristik (campuran broad/mid/lokal + banned-filter),
  BUKAN pengetahuan algoritma Instagram.
- Tone dirancang dari pola umum caption jualan, bukan riset terukur.
- Sisipan Bahasa Bali = frasa umum, bukan terjemahan penuh tervalidasi.
- Rate limit + cache in-memory: reset saat serverless cold start.

## Acceptance criteria MVP

- [x] Isi produk + deskripsi + kategori - hasil <15 detik (terverifikasi
      produksi 2026-09-29)
- [x] 3 caption + 15 hashtag tampil, tombol salin bekerja
- [x] History survive refresh (localStorage)
- [x] Kuota/AI gagal: pesan jelas + tombol coba lagi, app tetap usable

## Roadmap (bukan MVP)

Auth, database, scheduling posting, tracking performa, team workspace,
API publik - lihat `docs/roadmap.md`.
