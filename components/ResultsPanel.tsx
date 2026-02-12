"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IssueCard } from "@/components/IssueCard";
import {
  CsvTable,
  CSV_ROW_ID_PREFIX,
  CSV_TABLE_CONTAINER_ID,
} from "@/components/CsvTable";
import type { ValidationResponse } from "@/types/validation";

const HIGHLIGHT_DURATION_MS = 2500;

type ResultsPanelProps = {
  result: ValidationResponse;
  imageIssue?: import("@/types/validation").ValidationIssue | null;
  imageChecking?: boolean;
  onApplyFix?: (issue: import("@/types/validation").ValidationIssue) => void;
  onCellChange?: (rowIndex: number, header: string, value: string) => void;
  onDownloadErrorReport?: () => void;
};

export function ResultsPanel({
  result,
  imageIssue = null,
  imageChecking = false,
  onApplyFix,
  onCellChange,
  onDownloadErrorReport,
}: ResultsPanelProps) {
  const { success, issues, headers, rows } = result;
  const allIssues = [
    ...issues,
    ...(imageIssue ? [imageIssue] : []),
  ];
  const errors = allIssues.filter((i) => i.type === "error");
  const warnings = allIssues.filter((i) => i.type === "warning");
  const hasTableData = headers && rows && rows.length > 0;
  const problematicRowNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const i of allIssues) {
      for (const r of i.rows ?? []) set.add(r);
      for (const c of i.cells ?? []) set.add(c.row);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [allIssues]);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToRows = useCallback((rowNumbers: number[]) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    if (rowNumbers.length === 0) {
      document.getElementById(CSV_TABLE_CONTAINER_ID)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    const firstRow = rowNumbers[0];
    const rowEl = document.getElementById(`${CSV_ROW_ID_PREFIX}${firstRow}`);
    if (rowEl) {
      setHighlightedRow(firstRow);
      rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightTimeoutRef.current = setTimeout(
        () => {
          setHighlightedRow(null);
          highlightTimeoutRef.current = null;
        },
        HIGHLIGHT_DURATION_MS
      );
      return;
    }
    document.getElementById(CSV_TABLE_CONTAINER_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="space-y-6">
      {hasTableData && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Data preview
          </h3>
          {imageChecking && (
            <p className="text-sm text-muted-foreground">
              Checking image URLs…
            </p>
          )}
          <CsvTable
            headers={headers}
            rows={rows}
            issues={allIssues}
            highlightedRow={highlightedRow}
            onCellChange={onCellChange}
          />
        </section>
      )}

      {hasTableData && problematicRowNumbers.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Problematic rows
          </h3>
          <div className="flex flex-wrap gap-2">
            {problematicRowNumbers.map((rowNum) => (
              <button
                key={rowNum}
                type="button"
                onClick={() => scrollToRows([rowNum])}
                className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {rowNum}
              </button>
            ))}
          </div>
        </section>
      )}

      {hasTableData && allIssues.length > 0 && onDownloadErrorReport && (
        <div>
          <button
            type="button"
            onClick={onDownloadErrorReport}
            className="text-sm font-medium text-primary hover:underline"
          >
            Download error report
          </button>
        </div>
      )}

      {success && allIssues.length === 0 && !imageChecking ? (
        <Card className="rounded-xl border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-3 p-6">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-base font-medium text-green-800 dark:text-green-200">
              No issues found. Your file looks ready for Matrixify.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {errors.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                Errors ({errors.length})
              </h3>
              <div className="space-y-3">
                {errors.map((issue, idx) => (
                  <IssueCard
                    key={`error-${idx}`}
                    issue={issue}
                    onGoToRows={hasTableData ? scrollToRows : undefined}
                    onApplyFix={onApplyFix}
                  />
                ))}
              </div>
            </section>
          )}
          {warnings.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Warnings ({warnings.length})
              </h3>
              <div className="space-y-3">
                {warnings.map((issue, idx) => (
                  <IssueCard
                    key={`warning-${idx}`}
                    issue={issue}
                    onGoToRows={hasTableData ? scrollToRows : undefined}
                    onApplyFix={onApplyFix}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
