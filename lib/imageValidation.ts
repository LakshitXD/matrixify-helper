const IMAGE_COLUMNS = ["Image Src", "Variant Image"] as const;

/** Canonical form for comparison: lowercase, spaces and underscores removed */
function canonicalHeader(s: string): string {
  return s.toLowerCase().replace(/[\s_]+/g, "");
}

function normalizeHeader(h: string, target: string): boolean {
  return canonicalHeader(h) === canonicalHeader(target);
}

export type UrlWithCells = {
  url: string;
  cells: { row: number; column: string }[];
};

/**
 * Collect all image URLs from Image Src / Variant Image columns.
 * Returns one entry per unique URL with the list of (row, column) cells that use it.
 */
export function collectImageUrls(
  headers: string[],
  rows: Record<string, string>[]
): UrlWithCells[] {
  const imageHeaders = headers.filter((h) =>
    IMAGE_COLUMNS.some((c) => normalizeHeader(h, c))
  );
  if (imageHeaders.length === 0) return [];

  const urlToCells = new Map<string, { row: number; column: string }[]>();

  rows.forEach((row, index) => {
    const displayRow = index + 2;
    for (const header of imageHeaders) {
      const value = (row[header] ?? "").trim();
      if (!value) continue;
      const list = urlToCells.get(value) ?? [];
      list.push({ row: displayRow, column: header });
      urlToCells.set(value, list);
    }
  });

  return Array.from(urlToCells.entries()).map(([url, cells]) => ({
    url,
    cells,
  }));
}

export type ImageCheckApiResult = {
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string;
  error?: string;
};

/**
 * Map API results to the list of cells that have broken (non-ok) URLs.
 */
export function mapFailedUrlsToCells(
  urlWithCells: UrlWithCells[],
  results: ImageCheckApiResult[]
): { row: number; column: string }[] {
  const failedUrls = new Set(
    results.filter((r) => !r.ok).map((r) => r.url.trim())
  );
  const cells: { row: number; column: string }[] = [];
  for (const { url, cells: cellList } of urlWithCells) {
    if (failedUrls.has(url.trim())) cells.push(...cellList);
  }
  return cells;
}
