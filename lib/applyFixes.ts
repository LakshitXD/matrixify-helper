import type { ValidationIssue } from "@/types/validation";

const SPECIAL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\uFEFF\u200B-\u200D\u2060\u00AD]/gu;

function cleanCell(value: string): string {
  return value.replace(SPECIAL_CHAR_REGEX, "");
}

export function applyFix(
  headers: string[],
  rows: Record<string, string>[],
  issue: ValidationIssue
): { headers: string[]; rows: Record<string, string>[] } {
  const fix = issue.fix;
  if (!fix) return { headers: [...headers], rows: rows.map((r) => ({ ...r })) };

  switch (fix.type) {
    case "rename_header": {
      const payload = fix.payload as { from: string; to: string } | undefined;
      if (!payload?.from || !payload?.to) return { headers: [...headers], rows: rows.map((r) => ({ ...r })) };
      const newHeaders = headers.map((h) => (h === payload.from ? payload.to : h));
      const newRows = rows.map((row) => {
        const out: Record<string, string> = {};
        for (const h of headers) {
          const key = h === payload.from ? payload.to : h;
          out[key] = row[h] ?? "";
        }
        return out;
      });
      return { headers: newHeaders, rows: newRows };
    }
    case "add_columns": {
      const payload = fix.payload as { columnNames: string[] } | undefined;
      if (!payload?.columnNames?.length) return { headers: [...headers], rows: rows.map((r) => ({ ...r })) };
      const existing = new Set(headers);
      const toAdd = payload.columnNames.filter((c) => !existing.has(c));
      const newHeaders = [...headers, ...toAdd];
      const newRows = rows.map((row) => {
        const out = { ...row };
        for (const col of toAdd) out[col] = "";
        return out;
      });
      return { headers: newHeaders, rows: newRows };
    }
    case "clean_special_chars": {
      const newRows = rows.map((row) => {
        const out: Record<string, string> = {};
        for (const h of headers) {
          out[h] = cleanCell(row[h] ?? "");
        }
        return out;
      });
      return { headers: [...headers], rows: newRows };
    }
    default:
      return { headers: [...headers], rows: rows.map((r) => ({ ...r })) };
  }
}
