"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCsv } from "@/lib/csvParser";
import { serializeToCsv } from "@/lib/csvParser";
import { cn } from "@/lib/utils";

type SnapshotSummary = {
  id: string;
  name: string;
  primaryKey: string | null;
  createdAt: string;
  headerCount: number;
};

export function DashboardClient() {
  const [snapshots, setSnapshots] = useState<SnapshotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [mergeSnapshotId, setMergeSnapshotId] = useState<string>("");
  const [mergePrimaryKey, setMergePrimaryKey] = useState<string>("");
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeResult, setMergeResult] = useState<{
    mergedHeaders: string[];
    mergedRows: Record<string, string>[];
    keysNotFound: string[];
  } | null>(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch("/api/snapshots");
      if (!res.ok) return;
      const data = await res.json();
      setSnapshots(data);
      if (data.length > 0 && !mergeSnapshotId) setMergeSnapshotId(data[0].id);
    } finally {
      setLoading(false);
    }
  }, [mergeSnapshotId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const handleMerge = useCallback(async () => {
    if (!updateFile || !mergeSnapshotId || !mergePrimaryKey) return;
    setMergeLoading(true);
    setMergeError(null);
    setMergeResult(null);
    try {
      const text = await updateFile.text();
      const { headers: updateHeaders, rows: updateRows } = parseCsv(text);
      const res = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshotId: mergeSnapshotId,
          updateHeaders,
          updateRows,
          primaryKey: mergePrimaryKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMergeError(data.message ?? "Merge failed");
        return;
      }
      setMergeResult({
        mergedHeaders: data.mergedHeaders,
        mergedRows: data.mergedRows,
        keysNotFound: data.keysNotFound ?? [],
      });
    } catch {
      setMergeError("Request failed");
    } finally {
      setMergeLoading(false);
    }
  }, [updateFile, mergeSnapshotId, mergePrimaryKey]);

  const downloadMerged = useCallback(() => {
    if (!mergeResult) return;
    const csv = serializeToCsv(mergeResult.mergedHeaders, mergeResult.mergedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [mergeResult]);

  const primaryKeyOptions = ["Handle", "Variant SKU"];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your snapshots</CardTitle>
          <p className="text-sm text-muted-foreground">
            Save a CSV as a store snapshot from the main Validator page after validating, then use it here for merging.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No snapshots yet. Validate a CSV on the main page and use &quot;Save as store snapshot&quot; to add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {snapshots.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">
                    {s.headerCount} columns · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Merge update CSV</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a CSV with only the primary key column and the columns you want to update. We&apos;ll fill the rest from the selected snapshot.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Snapshot
              </label>
              <Select value={mergeSnapshotId} onValueChange={setMergeSnapshotId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select snapshot" />
                </SelectTrigger>
                <SelectContent>
                  {snapshots.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Primary key
              </label>
              <Select value={mergePrimaryKey} onValueChange={setMergePrimaryKey}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  {primaryKeyOptions.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Update CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  setUpdateFile(e.target.files?.[0] ?? null);
                  setMergeResult(null);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>
          </div>
          <Button
            onClick={handleMerge}
            disabled={!updateFile || !mergeSnapshotId || !mergePrimaryKey || mergeLoading}
          >
            {mergeLoading ? "Merging…" : "Merge"}
          </Button>
          {mergeError && (
            <p className="text-sm text-red-600 dark:text-red-400">{mergeError}</p>
          )}
          {mergeResult && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-medium">
                Merged {mergeResult.mergedRows.length} row(s).
                {mergeResult.keysNotFound.length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {" "}{mergeResult.keysNotFound.length} key(s) not found in snapshot.
                  </span>
                )}
              </p>
              <Button size="sm" onClick={downloadMerged}>
                Download merged CSV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
