"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultsPanel } from "@/components/ResultsPanel";
import type { ValidationResponse } from "@/types/validation";
import type { ValidationIssue } from "@/types/validation";
import type { ColumnMapping } from "@/types/mapping";
import type { MappingProfile } from "@/types/mapping";
import { cn } from "@/lib/utils";
import { applyFix } from "@/lib/applyFixes";
import { parseCsv, serializeToCsv } from "@/lib/csvParser";
import { autoMap, applyMapping } from "@/lib/fieldMapper";
import { runAllValidators } from "@/lib/validators";
import {
  collectImageUrls,
  mapFailedUrlsToCells,
  type ImageCheckApiResult,
} from "@/lib/imageValidation";
import {
  getProfiles,
  saveProfile,
  exportProfilesToJson,
  importProfilesFromJson,
} from "@/lib/profileStorage";
import { MappingEditor } from "@/components/MappingEditor";
import { MetafieldsWizard } from "@/components/MetafieldsWizard";
import { BulkSplitter } from "@/components/BulkSplitter";
import { SaveSnapshotButton } from "@/components/SaveSnapshotButton";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [profiles, setProfiles] = useState<MappingProfile[]>([]);
  const [loadedProfileMapping, setLoadedProfileMapping] =
    useState<ColumnMapping | null>(null);
  const [imageIssue, setImageIssue] = useState<ValidationIssue | null>(null);
  const [imageChecking, setImageChecking] = useState(false);

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  const validateFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }
    setError(null);
  }, []);

  const handleFile = useCallback(
    (f: File | null) => {
      setResult(null);
      setFile(f);
      if (f) validateFile(f);
      else setError(null);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null;
      handleFile(selected);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleSubmit = useCallback(async () => {
    if (!file || error) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/validate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Validation request failed.");
        setResult(null);
        return;
      }

      setResult(data as ValidationResponse);
      setLoadedProfileMapping(null);
      setImageIssue(null);
      const payload = data as ValidationResponse;
      if (payload.headers?.length && payload.rows?.length) {
        setImageChecking(true);
        const urlWithCells = collectImageUrls(payload.headers, payload.rows);
        const urls = urlWithCells.map((u) => u.url);
        if (urls.length > 0) {
          try {
            const imgRes = await fetch("/api/validate-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ urls }),
            });
            const imgData = await imgRes.json();
            const results = (imgData.results ?? []) as ImageCheckApiResult[];
            const brokenCells = mapFailedUrlsToCells(urlWithCells, results);
            if (brokenCells.length > 0) {
              const affectedRows = [...new Set(brokenCells.map((c) => c.row))];
              setImageIssue({
                type: "warning",
                title: "Broken image URLs",
                description: `${brokenCells.length} image URL(s) could not be reached or returned an error.`,
                rows: affectedRows,
                cells: brokenCells,
                suggestion: "Fix or remove the broken URLs, or clear them using the fix below.",
                fix: {
                  type: "clear_broken_images",
                  payload: { cells: brokenCells },
                },
              });
            }
          } catch {
            setImageIssue(null);
          }
        }
        setImageChecking(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [file, error]);

  const handleApplyFix = useCallback(
    async (issue: ValidationIssue) => {
      if (!result?.headers || !result?.rows || !issue.fix) return;
      if (issue.fix.type === "apply_encoding") {
        const enc = (issue.fix.payload as { suggestedEncoding?: string })
          ?.suggestedEncoding;
        if (!enc || !file) return;
        setLoading(true);
        try {
          const buffer = await file.arrayBuffer();
          const decoded = new TextDecoder(enc).decode(buffer);
          const parsed = parseCsv(decoded);
          const issues = runAllValidators(parsed.headers, parsed.rows);
          const hasError = issues.some((i) => i.type === "error");
          setResult({
            success: !hasError,
            issues,
            headers: parsed.headers,
            rows: parsed.rows,
          });
        } catch {
          setError("Could not re-encode file. Try saving as UTF-8 in your editor.");
        } finally {
          setLoading(false);
        }
        return;
      }
      if (issue.fix.type === "clear_broken_images") setImageIssue(null);
      const { headers: newHeaders, rows: newRows } = applyFix(
        result.headers,
        result.rows,
        issue
      );
      const issues = runAllValidators(newHeaders, newRows);
      const hasError = issues.some((i) => i.type === "error");
      setResult({
        success: !hasError,
        issues,
        headers: newHeaders,
        rows: newRows,
      });
    },
    [result, file]
  );

  const handleLoadProfile = useCallback((profile: MappingProfile) => {
    setLoadedProfileMapping(profile.mapping);
  }, []);

  const handleSaveProfile = useCallback((name: string, mapping: ColumnMapping) => {
    saveProfile({ name, mapping });
    setProfiles(getProfiles());
  }, []);

  const handleExportProfiles = useCallback(() => {
    const json = exportProfilesToJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matrixify-helper-profiles.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportProfiles = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      importProfilesFromJson(text);
      setProfiles(getProfiles());
    } catch {
      setError("Invalid profiles file.");
    }
  }, []);

  const handleApplyMapping = useCallback(
    (mapping: Record<string, string>) => {
      if (!result?.headers || !result?.rows) return;
      const { headers: newHeaders, rows: newRows } = applyMapping(
        result.headers,
        result.rows,
        mapping
      );
      const issues = runAllValidators(newHeaders, newRows);
      const hasError = issues.some((i) => i.type === "error");
      setResult({
        success: !hasError,
        issues,
        headers: newHeaders,
        rows: newRows,
      });
    },
    [result]
  );

  const handleDownloadFixedCsv = useCallback(() => {
    if (!result?.headers || !result?.rows) return;
    const csv = serializeToCsv(result.headers, result.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file?.name?.replace(/\.csv$/i, "-fixed.csv") ?? "matrixify-fixed.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file?.name]);

  const handleCellChange = useCallback(
    (rowIndex: number, header: string, value: string) => {
      if (!result?.headers || !result?.rows) return;
      const newRows = result.rows.map((r, i) =>
        i === rowIndex ? { ...r, [header]: value } : r
      );
      const issues = runAllValidators(result.headers, newRows);
      const hasError = issues.some((i) => i.type === "error");
      setResult({
        ...result,
        success: !hasError,
        issues,
        rows: newRows,
      });
    },
    [result]
  );

  const handleDownloadErrorReport = useCallback(() => {
    if (!result?.headers || !result?.rows || !result?.issues?.length) return;
    const allIssueRows = new Set<number>();
    for (const i of result.issues) {
      for (const r of i.rows ?? []) allIssueRows.add(r);
      for (const c of i.cells ?? []) allIssueRows.add(c.row);
    }
    const problemRowNumbers = Array.from(allIssueRows).sort((a, b) => a - b);
    const problemRowsData = result.rows.filter((_, index) =>
      problemRowNumbers.includes(index + 2)
    );
    const report = {
      generatedAt: new Date().toISOString(),
      summary: result.issues.map(({ type, title, description, rows, cells, suggestion }) => ({
        type,
        title,
        description,
        rows,
        cells,
        suggestion,
      })),
      problemRowNumbers,
      problemRowsData,
      headers: result.headers,
    };
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matrixify-error-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const canSubmit = file && !error && !loading;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div
            className={cn(
              "flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
              dragActive
                ? "border-primary/50 bg-muted/50"
                : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={handleInputChange}
              disabled={loading}
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer text-center text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                Drop your CSV here
              </span>
              <span className="block mt-1">or click to browse</span>
            </label>
            {file && (
              <p className="text-sm font-medium text-foreground truncate max-w-full">
                {file.name}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {loading && (
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                aria-label="Validating"
              />
            )}
            {!loading && canSubmit && (
              <Button type="button" onClick={handleSubmit} size="lg">
                Validate file
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {result.headers && result.headers.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Map fields</h2>
              <MappingEditor
                fileHeaders={result.headers}
                initialMapping={
                  loadedProfileMapping ?? autoMap(result.headers).mapping
                }
                onApply={handleApplyMapping}
                profiles={profiles}
                onLoadProfile={handleLoadProfile}
                onSaveProfile={handleSaveProfile}
                onExportProfiles={handleExportProfiles}
                onImportProfiles={handleImportProfiles}
              />
            </section>
          )}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Validation results</h2>
              <div className="flex flex-wrap items-center gap-2">
                {result.headers && result.rows && result.rows.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadFixedCsv}
                    >
                      Download fixed CSV
                    </Button>
                    <SaveSnapshotButton
                      headers={result.headers}
                      rows={result.rows}
                      primaryKey="Handle"
                    />
                  </>
                )}
              </div>
            </div>
          <ResultsPanel
            result={result}
            imageIssue={imageIssue}
            imageChecking={imageChecking}
            onApplyFix={handleApplyFix}
            onCellChange={handleCellChange}
            onDownloadErrorReport={handleDownloadErrorReport}
          />
          </div>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Bulk File Splitter</h2>
        <BulkSplitter />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Metafields Wizard</h2>
        <MetafieldsWizard existingHeaders={result?.headers ?? []} />
      </section>
    </div>
  );
}
