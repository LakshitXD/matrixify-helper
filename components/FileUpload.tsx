"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultsPanel } from "@/components/ResultsPanel";
import type { ValidationResponse } from "@/types/validation";
import { cn } from "@/lib/utils";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
    } catch {
      setError("Something went wrong. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [file, error]);

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
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Validation results</h2>
          <ResultsPanel result={result} />
        </div>
      )}
    </div>
  );
}
