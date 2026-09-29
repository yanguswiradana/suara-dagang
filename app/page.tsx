"use client";

import { useEffect, useState } from "react";
import {
  deleteHistory,
  loadBrand,
  loadHistory,
  pushHistory,
  saveBrand,
  type BrandProfile,
  type HistoryEntry,
} from "@/lib/storage";

interface GenerateResponse {
  captions: { label: string; text: string }[];
  hashtags: string[];
  cached?: boolean;
  error?: string;
}

const TONES = [
  { value: "santai", label: "Santai" },
  { value: "formal", label: "Formal" },
  { value: "promosi", label: "Promosi" },
  { value: "balivibes", label: "Bali Vibes" },
];

const CATEGORIES = ["kuliner", "fashion", "kerajinan", "jasa", "umum"];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }
}

export default function Home() {
  const [brand, setBrand] = useState<BrandProfile>({
    businessName: "",
    category: "kuliner",
    location: "",
  });
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("santai");
  const [language, setLanguage] = useState("id");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<
    (GenerateResponse & { product: string }) | null
  >(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setBrand(loadBrand());
    setHistory(loadHistory());
  }, []);

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setImage(undefined);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  }

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
        body: JSON.stringify({ ...brand, product, description, tone, language, imageBase64: image }),
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
          language,
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

  async function copy(label: string, text: string) {
    const ok = await copyText(text);
    setCopied(ok ? label : "gagal");
    setTimeout(() => setCopied(""), 1500);
  }

  const allInOne = result
    ? `${result.captions[0]?.text ?? ""}\n\n.\n.\n.\n${result.hashtags.join(" ")}`
    : "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">SuaraDagang</h1>
        <p className="text-stone-600">
          Caption + hashtag siap posting untuk UMKM. Isi, generate, salin.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Nama usaha</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={brand.businessName}
              onChange={(e) => setBrand({ ...brand, businessName: e.target.value })}
              placeholder="Warung Sari Rasa"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Kategori</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={brand.category}
              onChange={(e) => setBrand({ ...brand, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Nama produk *</span>
          <input
            required
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Ayam Betutu Frozen 500gr"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Deskripsi produk *</span>
          <textarea
            required
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bumbu base gede, ayam kampung, tahan 1 bulan di freezer, harga 85rb..."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">Tone</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Bahasa</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Foto (opsional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImage}
              className="mt-1 w-full text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Membuat caption..." : "Generate Caption"}
        </button>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}{" "}
            <button type="submit" className="font-semibold underline">
              Coba lagi
            </button>
          </div>
        )}
      </form>

      {result && (
        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Hasil untuk {result.product}</h2>
            {result.cached && (
              <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
                dari cache (instan, tanpa AI call)
              </span>
            )}
          </div>
          {result.captions.map((c, i) => (
            <article key={i} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold uppercase">
                  {c.label}
                </span>
                <button
                  onClick={() => copy(`c${i}`, c.text)}
                  className="rounded-lg border px-3 py-1 text-sm"
                >
                  {copied === `c${i}` ? "Tersalin!" : "Salin"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm">{c.text}</p>
            </article>
          ))}
          <article className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">
                Hashtag ({result.hashtags.length})
              </span>
              <button
                onClick={() => copy("tags", result.hashtags.join(" "))}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                {copied === "tags" ? "Tersalin!" : "Salin semua"}
              </button>
            </div>
            <p className="text-sm text-sky-800">{result.hashtags.join(" ")}</p>
          </article>
          <button
            onClick={() => copy("all", allInOne)}
            className="w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white"
          >
            {copied === "all" ? "Tersalin!" : "Salin paket siap posting"}
          </button>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold">Riwayat (tersimpan di perangkat)</h2>
          <ul className="space-y-2">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <button
                  className="text-left"
                  onClick={() =>
                    setResult({
                      captions: h.captions,
                      hashtags: h.hashtags,
                      product: h.product,
                    })
                  }
                >
                  <span className="font-medium">{h.product}</span>{" "}
                  <span className="text-stone-500">
                    - {h.tone} - {new Date(h.createdAt).toLocaleString("id-ID")}
                  </span>
                </button>
                <button
                  className="ml-2 text-red-600"
                  onClick={() => setHistory(deleteHistory(h.id))}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
