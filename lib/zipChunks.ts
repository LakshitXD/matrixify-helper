import JSZip from "jszip";
import { serializeToCsv } from "@/lib/csvParser";
import type { CsvChunk } from "@/lib/splitCsv";

/**
 * Pack CSV chunks into a single ZIP file. Returns a Blob (application/zip).
 * @param chunks - Result from splitCsv
 * @param baseName - Base filename without extension (e.g. "products") → products-part-1.csv, products-part-2.csv
 */
export async function zipChunks(
  chunks: CsvChunk[],
  baseName: string
): Promise<Blob> {
  const zip = new JSZip();
  const safeBase = baseName.replace(/\.csv$/i, "").trim() || "chunk";
  for (const ch of chunks) {
    const csv = serializeToCsv(ch.headers, ch.rows);
    const filename = `${safeBase}-part-${ch.index}.csv`;
    zip.file(filename, csv, { binary: false });
  }
  return zip.generateAsync({ type: "blob" });
}
