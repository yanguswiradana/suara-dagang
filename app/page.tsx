"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  loadBrand,
  saveBrand,
  loadHistory,
  pushHistory,
  deleteHistory,
  type BrandProfile,
  type HistoryEntry,
} from "@/lib/storage";

/* ── Types ── */

interface GenerateResponse {
  captions: { label: string; text: string }[];
  hashtags: string[];
  cached?: boolean;
  error?: string;
}

/* ── Constants ── */

const CATEGORIES = ["kuliner", "fashion", "kerajinan", "jasa", "umum"] as const;
const TONES = ["santai", "formal", "promosi", "balivibes"] as const;

/* ── Helpers ── */

function copyText(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
}

function fmt(d: Date) {
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

/* ── Component ── */

export default function Home() {
  // ─ Theme ─
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    const next = document.documentElement.classList.contains("dark");
    localStorage.setItem("sd:theme", next ? "dark" : "light");
    setDark(next);
  }

  // ─ Form state ─
  const [brand, setBrand] = useState<BrandProfile>({ businessName: "", category: "kuliner", location: "" });
  const [product, setProduct] = useState("");
  const [desc, setDesc] = useState("");
  const [tone, setTone] = useState<string>("santai");
  const [lang, setLang] = useState("id");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─ Result + history ─
  const [result, setResult] = useState<(GenerateResponse & { product: string }) | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setBrand(loadBrand());
    setHistory(loadHistory());
  }, []);

  // ─ Clock ─
  const [clock, setClock] = useState("—");
  useEffect(() => {
    setClock(fmt(new Date()));
    const t = setInterval(() => setClock(fmt(new Date())), 60_000);
    return () => clearInterval(t);
  }, []);

  // ─ Image handler ─
  const fileRef = useRef<HTMLInputElement>(null);
  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setImage(undefined);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  }

  // ─ Bersihkan panel: reset hasil + seluruh form ─
  function clearPanel() {
    setResult(null);
    setError("");
    setBrand({ businessName: "", category: "kuliner", location: "" });
    setProduct("");
    setDesc("");
    setTone("santai");
    setLang("id");
    setImage(undefined);
    if (fileRef.current) fileRef.current.value = "";
    saveBrand({ businessName: "", category: "kuliner", location: "" });
  }

  // ─ Submit ─
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    saveBrand(brand);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: brand.businessName,
          product,
          description: desc,
          category: brand.category,
          tone,
          language: lang,
          imageBase64: image,
        }),
      });
      const data: GenerateResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal generate.");
      setResult({ ...data, product });
      setHistory(
        pushHistory({
          id: `${Date.now()}`,
          createdAt: new Date().toISOString(),
          product,
          tone,
          language: lang,
          captions: data.captions,
          hashtags: data.hashtags,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate.");
    } finally {
      setLoading(false);
    }
  }

  // ─ Copy ─
  const doCopy = useCallback(
    async (key: string, btn: HTMLButtonElement | null) => {
      const map: Record<string, string> = {
        cap0: result?.captions[0]?.text ?? "",
        cap1: result?.captions[1]?.text ?? "",
        cap2: result?.captions[2]?.text ?? "",
        tags: result?.hashtags.join(" ") ?? "",
        all: result ? `${result.captions[0]?.text ?? ""}\n\n.\n.\n.\n${result.hashtags.join(" ")}` : "",
      };
      const text = map[key];
      if (!text) return;
      await copyText(text);
      if (btn) {
        const orig = btn.textContent ?? "";
        btn.textContent = "Tersalin";
        setTimeout(() => { if (btn) btn.textContent = orig; }, 1200);
      }
    },
    [result]
  );

  // ─ History ─
  function restoreHistory(i: number) {
    const h = history[i];
    if (h) setResult({ captions: h.captions, hashtags: h.hashtags, product: h.product });
  }
  function removeHistoryItem(i: number) {
    setHistory(deleteHistory(history[i].id));
  }

  return (
    <>
      {/* ═══ STICKY NAV ═══ */}
      <nav className="sticky top-0 z-30 bg-[var(--paper)] border-b-[1.5px] border-[var(--line)]" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <span className="font-[var(--font-fraunces)] text-xl font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>SuaraDagang</span>
          <div className="flex items-center gap-4">
            <a href="#cara-kerja" className="hidden sm:block kicker hover:text-[var(--ink)] transition">Cara kerja</a>
            <a href="#tool" className="hidden sm:block kicker hover:text-[var(--ink)] transition">Generator</a>
            <button onClick={toggleTheme} aria-label="Ganti tema" className="w-8 h-8 flex items-center justify-center rounded-full border-[1.5px] border-[var(--line)]">
              {dark ? "☀️" : "🌙"}
            </button>
            <a href="#tool" className="btn-fuel px-4 py-2 text-xs font-bold uppercase tracking-wide">Mulai generate</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="px-5 sm:px-10 pt-14 sm:pt-22 pb-12 sm:pb-16 max-w-6xl mx-auto">
        <span className="kicker">SuaraDagang / Generator caption UMKM Bali</span>
        <h1 className="font-bold leading-[1.05] mt-3" style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          Caption jualan yang
          <br />
          bikin orang <span className="inline-block px-2 rounded" style={{ background: "var(--moss)", color: "#fffdf8", border: "1.5px solid var(--ink)" }}>beli</span>,
          <br />
          bukan sekadar like.
        </h1>
        <p className="text-base sm:text-lg mt-4 max-w-xl leading-relaxed" style={{ color: "var(--soft)" }}>
          Isi deskripsi produkmu, pilih gaya bahasa, dapatkan tiga opsi caption + 15 hashtag yang siap copy-paste ke Instagram. Untuk pedagang, bukan kreator.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <a href="#tool" className="btn-fuel px-6 py-3 text-sm font-bold uppercase tracking-wide">Coba sekarang</a>
          <a href="#cara-kerja" className="btn-ghost px-6 py-3 text-sm font-bold uppercase tracking-wide">Lihat cara kerja</a>
        </div>
        {/* Stats */}
        <div className="rule mt-8 pt-5 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <span className="font-bold" style={{ fontFamily: "var(--font-fraunces)", fontSize: "2rem" }}>3</span>
            <p className="kicker mt-1">Opsi caption</p>
          </div>
          <div>
            <span className="font-bold" style={{ fontFamily: "var(--font-fraunces)", fontSize: "2rem" }}>15</span>
            <p className="kicker mt-1">Hashtag lokal Bali</p>
          </div>
          <div>
            <span className="font-bold" style={{ fontFamily: "var(--font-fraunces)", fontSize: "2rem" }}>&lt;15<span className="text-lg">dtk</span></span>
            <p className="kicker mt-1">Siap posting</p>
          </div>
        </div>
      </section>

      {/* ═══ CARA KERJA ═══ */}
      <section id="cara-kerja" className="px-5 sm:px-10 py-12 sm:py-16 bg-[var(--panel)]">
        <div className="max-w-6xl mx-auto">
          <span className="kicker">Workflow</span>
          <h2 className="font-bold text-3xl sm:text-4xl mt-2" style={{ fontFamily: "var(--font-fraunces)" }}>Tiga langkah, beres.</h2>
          <p className="mt-2 max-w-md" style={{ color: "var(--soft)" }}>Tanpa daftar, tanpa kartu kredit, tanpa drama. Brief masuk, caption keluar.</p>
          <ol className="mt-8 space-y-6 max-w-2xl">
            {[
              { num: "01", color: "var(--fuel)", title: "Ceritakan produkmu", text: "Nama usaha, nama produk, deskripsi singkat, kategori. Makin jelas, makin nendang captionnya." },
              { num: "02", color: "var(--moss)", title: "Pilih gaya bahasa", text: "Santai, formal, promosi, atau Bali Vibes dengan sentuhan Rahajeng sesuai karakter usahamu." },
              { num: "03", color: "var(--ink)", title: "Salin dan posting", text: "Tiga caption + 15 hashtag lokal, satu tombol salin paket siap paste ke Instagram." },
            ].map((s) => (
              <li key={s.num} className="rule pb-5 flex gap-5">
                <span className="font-bold shrink-0" style={{ fontFamily: "var(--font-fraunces)", fontSize: "2.25rem", color: s.color }}>{s.num}</span>
                <div>
                  <h3 className="font-bold text-lg">{s.title}</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--soft)" }}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href="#tool" className="inline-block mt-8 btn-fuel px-6 py-3 text-sm font-bold uppercase tracking-wide">Mulai generate sekarang</a>
        </div>
      </section>

      {/* ═══ WORKSPACE ═══ */}
      <div id="tool" className="min-h-screen grid lg:grid-cols-[380px_1fr]">

        {/* ── RAIL ── */}
        <aside className="rail-scroll text-[var(--rail-ink)] lg:sticky lg:top-[53px] lg:h-[calc(100vh-53px)] overflow-y-auto" style={{ background: "var(--rail)" }}>
          <div className="p-6 pr-10 sm:p-8 sm:pr-12">
            <div className="rule pb-4" style={{ borderColor: "var(--rail-soft)" }}>
              <p className="kicker" style={{ color: "var(--rail-soft)" }}>Generator / UMKM Bali</p>
              <h2 className="font-bold text-2xl leading-tight mt-1" style={{ fontFamily: "var(--font-fraunces)" }}>
                Tiga caption,
                <br />
                lima belas hashtag,
                <br />
                <span style={{ color: "var(--fuel)" }}>tulis sekali.</span>
              </h2>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* Brand + Category */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="kicker" style={{ color: "var(--rail-soft)" }}>Nama usaha</span>
                  <input
                    value={brand.businessName}
                    onChange={(e) => setBrand({ ...brand, businessName: e.target.value })}
                    placeholder="Warung Sari Rasa"
                    className="mt-1 w-full px-3 py-2 text-sm rail-fld"
                  />
                </label>
                <label className="block">
                  <span className="kicker" style={{ color: "var(--rail-soft)" }}>Kategori</span>
                  <select
                    value={brand.category}
                    onChange={(e) => setBrand({ ...brand, category: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rail-fld"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Product */}
              <label className="block">
                <span className="kicker" style={{ color: "var(--rail-soft)" }}>Nama produk *</span>
                <input
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Ayam Betutu Frozen 500 gr"
                  className="fld mt-1 w-full px-3 py-2 text-sm"
                />
              </label>

              {/* Description */}
              <label className="block">
                <span className="kicker" style={{ color: "var(--rail-soft)" }}>Deskripsi *</span>
                <textarea
                  required
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ayam kampung, bumbu base gede, tahan 1 bulan, Rp 85.000..."
                  className="fld mt-1 w-full px-3 py-2 text-sm"
                />
              </label>

              {/* Tone */}
              <div>
                <span className="kicker" style={{ color: "var(--rail-soft)" }}>Gaya bahasa</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="tone-btn"
                      aria-pressed={tone === t}
                      onClick={() => setTone(t)}
                    >
                      {t === "balivibes" ? "Bali Vibes" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lang + Photo */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="kicker" style={{ color: "var(--rail-soft)" }}>Bahasa</span>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm rail-fld"
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <label className="block">
                  <span className="kicker" style={{ color: "var(--rail-soft)" }}>Foto (opsional)</span>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="mt-1 w-full text-xs" style={{ color: "var(--rail-soft)" }} />
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-fuel w-full py-3 font-bold tracking-wide uppercase text-sm">
                {loading ? "Membuat caption..." : "Generate"}
              </button>

              {/* Error */}
              {error && (
                <div className="rounded border p-3 text-sm" style={{ borderColor: "#dc2626", background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
                  {error}{" "}
                  <button type="submit" className="font-semibold underline">Coba lagi</button>
                </div>
              )}

              <p className="text-xs text-center" style={{ color: "var(--rail-soft)" }}>Brief tidak disimpan di server.</p>
            </form>
          </div>
        </aside>

        {/* ── OUTPUT FEED ── */}
        <section className="px-5 sm:px-10 py-8 sm:py-12">
          <header className="flex items-baseline justify-between rule pb-3">
            <span className="kicker">Output feed</span>
            <span className="kicker">{clock}</span>
          </header>

          {/* Empty state */}
          {!result && (
            <div className="mt-10 max-w-2xl">
              <p className="text-4xl sm:text-5xl leading-[1.05]" style={{ fontFamily: "var(--font-fraunces)" }}>Panel ini masih kosong.</p>
              <p className="text-sm mt-3 max-w-md" style={{ color: "var(--soft)" }}>
                Pilih gaya bahasa di rail kiri, lalu tekan Generate. Tiga varian
                caption dalam gaya itu plus hashtag lokal Bali akan mendarat di sini.
              </p>
              <ul className="mt-6 space-y-2 text-sm" style={{ color: "var(--faint)" }}>
                <li className="flex gap-3"><span className="kicker">Santai</span> casual, humoris, atau cerita harian</li>
                <li className="flex gap-3"><span className="kicker">Formal</span> informatif, singkat, atau premium</li>
                <li className="flex gap-3"><span className="kicker">Promosi</span> urgensi, harga, atau hype</li>
                <li className="flex gap-3"><span className="kicker">Bali Vibes</span> santai, komunitas, atau promo lokal</li>
              </ul>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-8">
              <div className="flex items-baseline gap-4 rule pb-2">
                <h3 className="text-2xl" style={{ fontFamily: "var(--font-fraunces)" }}>Hasil</h3>
                <span className="kicker">{result.product} / {result.captions.length} opsi / {result.hashtags.length} tag</span>
              </div>

              {result.captions.map((c, i) => (
                <div key={i} className="hairline p-5 bg-[var(--panel)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="kicker">{String(i + 1).padStart(2, "0")} / {c.label}</span>
                    <button
                      onClick={(e) => doCopy(`cap${i}`, e.currentTarget)}
                      className="btn-ghost px-3 py-1 text-xs font-bold uppercase tracking-wide"
                    >
                      Salin
                    </button>
                  </div>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{c.text}</p>
                </div>
              ))}

              <div className="hairline p-5 bg-[var(--panel)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="kicker">Hashtag / 15 tag</span>
                  <button
                    onClick={(e) => doCopy("tags", e.currentTarget)}
                    className="btn-ghost px-3 py-1 text-xs font-bold uppercase tracking-wide"
                  >
                    Salin semua
                  </button>
                </div>
                <p className="text-sm leading-relaxed break-words" style={{ fontFamily: "var(--font-plex-mono)", color: "var(--soft)" }}>
                  {result.hashtags.join(" ")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={(e) => doCopy("all", e.currentTarget)}
                  className="btn-fuel px-5 py-3 text-sm font-bold uppercase tracking-wide"
                >
                  Salin paket siap posting
                </button>
                <button onClick={clearPanel} className="btn-ghost px-5 py-3 text-sm font-bold uppercase tracking-wide">
                  Bersihkan panel
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <header className="mt-14 flex items-baseline justify-between rule pb-3">
            <span className="kicker">Arsip lokal / browser</span>
            <span className="kicker">{history.length} item</span>
          </header>
          <ul className="mt-4 divide-y" style={{ borderColor: "var(--line)" }}>
            {history.length === 0 ? (
              <li className="py-3 text-sm" style={{ color: "var(--faint)" }}>Belum ada arsip. Hasil generate tersimpan otomatis di browser ini.</li>
            ) : (
              history.map((h, i) => (
                <li key={h.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <button className="text-left hover:underline" onClick={() => restoreHistory(i)}>
                    <span className="font-bold">{h.product}</span>
                    <span className="kicker"> {h.tone} / {new Date(h.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </button>
                  <button className="kicker hover:text-red-500" onClick={() => removeHistoryItem(i)}>hapus</button>
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          <footer className="mt-16 rule pb-3 flex justify-between text-xs" style={{ color: "var(--faint)" }}>
            <span style={{ fontFamily: "var(--font-fraunces)" }}>SuaraDagang &copy; 2026</span>
            <span className="kicker">Dibangun untuk UMKM Bali</span>
          </footer>
        </section>
      </div>
    </>
  );
}
