# SuaraDagang - Roadmap

> Urutan pengerjaan bertahap. Deadline MVP: 2026-10-01 (solo).

## Fase 0 - Fondasi (SELESAI)

- [x] Riset ide + perbandingan 4 kandidat, pemenang: Caption Studio → nama **SuaraDagang**
- [x] Grilling scope: persona UMKM, foto opsional, Google AI Studio, hashtag heuristic
- [x] Flow + acceptance criteria terkunci (2026-09-28)
- [x] Scaffold Next.js: API route + lib (gemini, hashtags, rate-limit, cache, storage)
- [x] Slicing final `slicing/index.html`: landing band + workspace editorial, dark/light

## Fase 1 - MVP fungsional (target 2026-10-01)

- [ ] Port slicing → komponen Next.js (`app/page.tsx` + Tailwind kelas, sama persis token)
- [ ] Wire form ke `/api/generate` sungguhan (bukan MOCK)
- [ ] State loading / error / retry di client
- [ ] Verifikasi end-to-end lokal: npm run dev + API key nyata
- [ ] README final: setup, keterbatasan jujur, acceptance criteria tercentang
- [ ] Deploy Vercel + env + smoke test URL publik

**Definisi selesai:** isi produk + deskripsi + kategori → hasil <15 detik →
3 caption + 15 hashtag tampil → tombol salin bekerja → history survive
refresh → error kuota menampilkan pesan jelas.

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
