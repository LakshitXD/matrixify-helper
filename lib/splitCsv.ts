import { serializeToCsv } from "@/lib/csvParser";

export type CsvChunk = {
  headers: string[];
  rows: Record<string, string>[];
  /** 1-based chunk index */
  index: number;
};

export type SplitResult = {
  chunks: CsvChunk[];
  totalRows: number;
  totalChunks: number;
};

/**
 * Split CSV rows into chunks of at most maxRowsPerChunk. Each chunk has the same headers.
 */
export function splitCsv(
  headers: string[],
  rows: Record<string, string>[],
  maxRowsPerChunk: number
): SplitResult {
  if (maxRowsPerChunk < 1) throw new Error("maxRowsPerChunk must be at least 1");
  const chunks: CsvChunk[] = [];
  for (let i = 0; i < rows.length; i += maxRowsPerChunk) {
    const slice = rows.slice(i, i + maxRowsPerChunk);
    chunks.push({
      headers: [...headers],
      rows: slice,
      index: chunks.length + 1,
    });
  }
  return {
    chunks,
    totalRows: rows.length,
    totalChunks: chunks.length,
  };
}

export function estimateChunkCount(
  totalRows: number,
  maxRowsPerChunk: number
): number {
  if (maxRowsPerChunk < 1) return 0;
  return Math.ceil(totalRows / maxRowsPerChunk);
}
