// localStorage persistence: brand profile + history live ONLY in the
// browser. No database in MVP (see README for the when-to-switch rule).

export interface BrandProfile {
  businessName: string;
  category: string;
  location: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  product: string;
  tone: string;
  language: string;
  captions: { label: string; text: string }[];
  hashtags: string[];
}

const BRAND_KEY = "suaradagang:brand";
const HISTORY_KEY = "suaradagang:history";
const HISTORY_CAP = 30;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadBrand(): BrandProfile {
  if (typeof window === "undefined")
    return { businessName: "", category: "kuliner", location: "" };
  return safeParse<BrandProfile>(localStorage.getItem(BRAND_KEY), {
    businessName: "",
    category: "kuliner",
    location: "",
  });
}

export function saveBrand(b: BrandProfile): void {
  localStorage.setItem(BRAND_KEY, JSON.stringify(b));
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY), []);
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, HISTORY_CAP);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function deleteHistory(id: string): HistoryEntry[] {
  const next = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
