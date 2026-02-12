"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseCsv } from "@/lib/csvParser";
import { serializeToCsv } from "@/lib/csvParser";
import { splitCsv, type CsvChunk } from "@/lib/splitCsv";
import { zipChunks } from "@/lib/zipChunks";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_ROWS = 10_000;
const SPLITTER_MAX_SIZE = 50 * 1024 * 1024; // 50MB for splitter (relaxed)

export function BulkSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [maxRowsPerChunk, setMaxRowsPerChunk] = useState(DEFAULT_MAX_ROWS);
  const [splitting, setSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    chunks: CsvChunk[];
    elapsedMs: number;
    baseName: string;
  } | null>(null);
  const [zipLoading, setZipLoading] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    setResult(null);
    if (f && f.size > SPLITTER_MAX_SIZE) {
      setError(`File is too large. Maximum size for splitter is ${SPLITTER_MAX_SIZE / 1024 / 1024}MB.`);
    }
  }, []);

  const handleSplit = useCallback(async () => {
    if (!file || error) return;
    setSplitting(true);
    setError(null);
    setResult(null);
    const start = performance.now();
    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);
      const { chunks, totalChunks } = splitCsv(headers, rows, maxRowsPerChunk);
      const elapsedMs = performance.now() - start;
      const baseName = file.name.replace(/\.csv$/i, "").trim() || "chunk";
      setResult({ chunks, elapsedMs, baseName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split file.");
    } finally {
      setSplitting(false);
    }
  }, [file, error, maxRowsPerChunk]);

  const downloadChunk = useCallback((chunk: CsvChunk) => {
    const csv = serializeToCsv(chunk.headers, chunk.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result?.baseName ?? "chunk"}-part-${chunk.index}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result?.baseName]);

  const downloadZip = useCallback(async () => {
    if (!result?.chunks.length) return;
    setZipLoading(true);
    try {
      const blob = await zipChunks(result.chunks, result.baseName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.baseName}-chunks.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipLoading(false);
    }
  }, [result]);

  const canSplit = file && !error && !splitting;

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Bulk File Splitter</CardTitle>
        <p className="text-sm text-muted-foreground">
          Split large CSVs into smaller chunks (e.g. for Matrixify). Max {SPLITTER_MAX_SIZE / 1024 / 1024}MB per file.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              CSV file
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Max rows per chunk
            </label>
            <input
              type="number"
              min={1}
              max={500000}
              value={maxRowsPerChunk}
              onChange={(e) => setMaxRowsPerChunk(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className={cn(
                "h-9 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                "focus:outline-none focus:ring-1 focus:ring-ring"
              )}
            />
          </div>
          <Button type="button" onClick={handleSplit} disabled={!canSplit}>
            {splitting ? "Splitting…" : "Split file"}
          </Button>
        </div>

        {splitting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-hidden
            />
            Parsing and splitting…
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {result && !splitting && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              Split complete in {(result.elapsedMs / 1000).toFixed(1)}s — {result.chunks.length} chunk
              {result.chunks.length !== 1 ? "s" : ""}.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={downloadZip} disabled={zipLoading}>
                {zipLoading ? "Preparing…" : "Download all as ZIP"}
              </Button>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex flex-wrap gap-1">
                {result.chunks.map((ch) => (
                  <Button
                    key={ch.index}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChunk(ch)}
                  >
                    Chunk {ch.index}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
