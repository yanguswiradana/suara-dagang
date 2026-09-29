# SuaraDagang - Roadmap

> Urutan pengerjaan bertahap. MVP: 2026-09-29 (solo).

## Fase 0 - Fondasi (SELESAI ✅ 2026-09-28)

- [x] Riset ide + perbandingan 4 kandidat, pemenang: Caption Studio → nama **SuaraDagang**
- [x] Grilling scope: persona UMKM, foto opsional, Google AI Studio, hashtag heuristic
- [x] Flow + acceptance criteria terkunci (2026-09-28)
- [x] Scaffold Next.js: API route + lib (gemini, hashtags, rate-limit, cache, storage)
- [x] Slicing final `slicing/index.html`: landing band + workspace editorial, dark/light

## Fase 1 - MVP fungsional (SELESAI ✅ 2026-09-29)

- [x] Port slicing → `app/page.tsx` + `app/globals.css` + `app/layout.tsx`
- [x] Wire form ke `/api/generate` sungguhan (bukan MOCK)
- [x] State loading / error / retry di client
- [x] Cache sebelum rate limit (cache hit tidak makan kuota)
- [x] Deploy Vercel + env + smoke test URL publik
- [x] Model fallback ke `gemini-3.5-flash-lite` (2.0-flash ditutup Google)
- [x] API terverifikasi produksi: HTTP 200, 3 caption + 15 hashtag
- [x] README final + `docs/DESIGN.md` + `docs/architecture.md`
- [x] tsc --noEmit 0 error

**Live:** https://suara-dagang.vercel.app
**Acceptance criteria tercentang:** isi produk + deskripsi + kategori →
<15 detik → 3 caption + 15 hashtag → salin bekerja → history survive refresh.

## Fase 2 - V2 (setelah MVP live)

- [ ] Auth (NextAuth) + pindah history localStorage → tabel per-user (Neon/Supabase)
- [ ] Vision wajib: foto → auto-deskripsi sebelum generate
- [ ] Hashtag scoring lanjutan + banned list terkurasi
- [ ] Brand voice per user (multi-profil usaha)
- [ ] Riwayat lintas perangkat + hapus per item dari server

## Fase 3 - V3 (arah SaaS)

- [ ] Content calendar + scheduling
- [ ] Tracking performa (input likes/comments, feedback loop prompt)
- [ ] Team workspace + approval
- [ ] Bulk generate + export CSV
- [ ] API publik + sistem kredit freemium

## Backlog / ide tersimpan

- Tone "Bali vibes" lebih dalam: kamus frasa + level kesantunan
- Preset caption per kategori dengan CTA berbeda (WA order vs visit vs DM)
- Template carousel / TikTok script (keluar dari format IG feed)
