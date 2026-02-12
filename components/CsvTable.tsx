"use client";

import type { ValidationIssue } from "@/types/validation";
import { cn } from "@/lib/utils";

export const CSV_ROW_ID_PREFIX = "csv-row-";
export const CSV_TABLE_CONTAINER_ID = "csv-data-preview";

type CsvTableProps = {
  headers: string[];
  rows: Record<string, string>[];
  issues: ValidationIssue[];
  /** Row number (1-based, 2 = first data row) to briefly highlight after scroll */
  highlightedRow?: number | null;
};

function getRowHighlight(
  displayRowNumber: number,
  issues: ValidationIssue[]
): "error" | "warning" | null {
  let hasError = false;
  let hasWarning = false;
  for (const issue of issues) {
    if (!issue.rows?.includes(displayRowNumber)) continue;
    if (issue.type === "error") hasError = true;
    else hasWarning = true;
  }
  if (hasError) return "error";
  if (hasWarning) return "warning";
  return null;
}

export function CsvTable({
  headers,
  rows,
  issues,
  highlightedRow = null,
}: CsvTableProps) {
  return (
    <div
      id={CSV_TABLE_CONTAINER_ID}
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="overflow-auto max-h-[min(70vh,600px)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 border-b border-border">
              <th className="sticky left-0 z-20 min-w-[3.5rem] bg-muted/95 px-3 py-2.5 text-left font-semibold text-muted-foreground border-r border-border">
                #
              </th>
              {headers.map((h) => (
                <th
                  key={h}
                  className="min-w-[120px] max-w-[240px] px-3 py-2.5 text-left font-semibold text-foreground whitespace-nowrap truncate"
                  title={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const displayRow = index + 2;
              const highlight = getRowHighlight(displayRow, issues);
              const isHighlighted = highlightedRow === displayRow;
              return (
                <tr
                  key={index}
                  id={`${CSV_ROW_ID_PREFIX}${displayRow}`}
                  className={cn(
                    "border-b border-border/80 hover:bg-muted/50 transition-colors",
                    highlight === "error" &&
                      "bg-red-100/80 dark:bg-red-950/30 border-l-4 border-l-red-500",
                    highlight === "warning" &&
                      "bg-amber-100/80 dark:bg-amber-950/30 border-l-4 border-l-amber-500",
                    isHighlighted &&
                      "ring-2 ring-primary ring-inset bg-primary/5 dark:bg-primary/10 animate-pulse"
                  )}
                >
                  <td className="sticky left-0 z-10 px-3 py-2 font-medium text-muted-foreground border-r border-border bg-inherit">
                    {displayRow}
                  </td>
                  {headers.map((h) => (
                    <td
                      key={h}
                      className="min-w-[120px] max-w-[240px] px-3 py-2 whitespace-nowrap truncate"
                      title={String(row[h] ?? "")}
                    >
                      {row[h] ?? ""}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <span>{rows.length} row(s)</span>
        {issues.some((i) => i.rows && i.rows.length > 0) && (
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-red-200 dark:bg-red-900/50 border border-red-400" />
              Error
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-200 dark:bg-amber-900/50 border border-amber-400" />
              Warning
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
