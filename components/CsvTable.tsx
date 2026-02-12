"use client";

import { useMemo, useState } from "react";
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
  /** When set, cells are editable; on blur/Enter this is called with 0-based rowIndex */
  onCellChange?: (rowIndex: number, header: string, value: string) => void;
};

function getBrokenCellSet(issues: ValidationIssue[]): Set<string> {
  const set = new Set<string>();
  for (const issue of issues) {
    for (const c of issue.cells ?? []) {
      set.add(`${c.row}:${c.column}`);
    }
  }
  return set;
}

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
  onCellChange,
}: CsvTableProps) {
  const brokenCells = useMemo(() => getBrokenCellSet(issues), [issues]);
  const editable = !!onCellChange;
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    header: string;
    value: string;
  } | null>(null);

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
                  {headers.map((h) => {
                    const cellKey = `${displayRow}:${h}`;
                    const isBrokenCell = brokenCells.has(cellKey);
                    const value = row[h] ?? "";
                    return (
                      <td
                        key={h}
                        className={cn(
                          "min-w-[120px] max-w-[240px] px-3 py-2 whitespace-nowrap",
                          !editable && "truncate",
                          isBrokenCell &&
                            "border border-red-400 bg-red-100/80 dark:bg-red-950/40"
                        )}
                        title={editable ? undefined : String(value)}
                      >
                        {editable ? (
                          <input
                            type="text"
                            className="w-full min-w-0 rounded border-0 bg-transparent px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={
                              editingCell?.rowIndex === index &&
                              editingCell?.header === h
                                ? editingCell.value
                                : value
                            }
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditingCell((prev) =>
                                prev?.rowIndex === index && prev?.header === h
                                  ? { ...prev, value: v }
                                  : { rowIndex: index, header: h, value: v }
                              );
                            }}
                            onFocus={() =>
                              setEditingCell({
                                rowIndex: index,
                                header: h,
                                value,
                              })
                            }
                            onBlur={(e) => {
                              const current = e.target.value;
                              if (current !== value)
                                onCellChange?.(index, h, current);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            aria-label={`Row ${displayRow} ${h}`}
                          />
                        ) : (
                          <span className="block truncate">{value}</span>
                        )}
                      </td>
                    );
                  })}
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
