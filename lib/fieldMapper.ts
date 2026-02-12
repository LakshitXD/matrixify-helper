import { REQUIRED_COLUMNS } from "@/lib/validators";
import type { AutoMapResult, ColumnMapping, MappingSuggestion } from "@/types/mapping";

const CANONICAL_COLUMNS_RAW = [
  ...REQUIRED_COLUMNS,
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Body (HTML)",
  "Vendor",
  "Product Type",
  "Tags",
  "Published",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Inventory Qty",
  "Image Src",
  "Variant Image",
  "Status",
];
const CANONICAL_COLUMNS: string[] = Array.from(
  new Set(CANONICAL_COLUMNS_RAW)
);

const FUZZY_THRESHOLD = 0.8;

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function normalizedKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

/** Levenshtein distance */
function distance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/** Similarity 0..1 (1 = identical) */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const d = distance(normalizedKey(a), normalizedKey(b));
  const maxLen = Math.max(a.length, b.length);
  return 1 - d / maxLen;
}

function findExactMatch(fileHeader: string): string | null {
  const n = normalize(fileHeader);
  const nk = normalizedKey(fileHeader);
  for (const canon of CANONICAL_COLUMNS) {
    if (normalize(canon) === n || normalizedKey(canon) === nk) return canon;
  }
  return null;
}

function findFuzzyMatch(fileHeader: string): { canonical: string; score: number } | null {
  let best: { canonical: string; score: number } | null = null;
  for (const canon of CANONICAL_COLUMNS) {
    const score = similarity(fileHeader, canon);
    if (score >= FUZZY_THRESHOLD && (!best || score > best.score)) {
      best = { canonical: canon, score };
    }
  }
  return best;
}

/**
 * Auto-map file headers to canonical Matrixify columns.
 * Uses exact match first, then fuzzy match above threshold.
 */
export function autoMap(fileHeaders: string[]): AutoMapResult {
  const mapping: ColumnMapping = {};
  const suggestions: MappingSuggestion[] = [];
  const unmapped: string[] = [];

  for (const h of fileHeaders) {
    const exact = findExactMatch(h);
    if (exact) {
      mapping[h] = exact;
      continue;
    }
    const fuzzy = findFuzzyMatch(h);
    if (fuzzy) {
      mapping[h] = fuzzy.canonical;
      suggestions.push({
        fileHeader: h,
        canonicalName: fuzzy.canonical,
        score: fuzzy.score,
      });
      continue;
    }
    unmapped.push(h);
  }

  return { mapping, suggestions, unmapped };
}

/**
 * Apply a column mapping to headers and rows (rename keys).
 * Unmapped columns are kept by default; set dropUnmapped to true to remove them.
 */
export function applyMapping(
  headers: string[],
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  dropUnmapped = false
): { headers: string[]; rows: Record<string, string>[] } {
  const order: string[] = [];
  for (const h of headers) {
    const k = mapping[h] ?? h;
    if (dropUnmapped && mapping[h] === undefined) continue;
    if (!order.includes(k)) order.push(k);
  }
  const newRows = rows.map((row) => {
    const out: Record<string, string> = {};
    for (const h of headers) {
      const key = mapping[h] ?? h;
      if (dropUnmapped && mapping[h] === undefined) continue;
      out[key] = row[h] ?? "";
    }
    return out;
  });
  return { headers: order, rows: newRows };
}

export function getCanonicalColumns(): string[] {
  return [...CANONICAL_COLUMNS];
}
