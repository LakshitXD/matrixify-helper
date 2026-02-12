import type { ValidationIssue } from "@/types/validation";

export const REQUIRED_COLUMNS = [
  "Handle",
  "Title",
  "Variant SKU",
  "Option1 Name",
  "Option1 Value",
] as const;

const TYPO_MAP: Record<string, string> = {
  "variant sku": "Variant SKU",
  variantsku: "Variant SKU",
  "option1 name": "Option1 Name",
  option1name: "Option1 Name",
  "option1 value": "Option1 Value",
  option1value: "Option1 Value",
  "option2 name": "Option2 Name",
  option2name: "Option2 Name",
  "option2 value": "Option2 Value",
  option2value: "Option2 Value",
  handle: "Handle",
  title: "Title",
};

function findHeader(headers: string[], canonicalName: string): boolean {
  const lower = canonicalName.toLowerCase().replace(/\s+/g, "");
  const withSpaces = canonicalName.toLowerCase();
  for (const h of headers) {
    if (h === canonicalName) return true;
    if (h.toLowerCase() === withSpaces) return true;
    if (h.toLowerCase().replace(/\s+/g, "") === lower) return true;
  }
  return false;
}

function getHeaderKey(headers: string[], canonicalName: string): string | null {
  const lower = canonicalName.toLowerCase().replace(/\s+/g, "");
  const withSpaces = canonicalName.toLowerCase();
  for (const h of headers) {
    if (h === canonicalName) return h;
    if (h.toLowerCase() === withSpaces) return h;
    if (h.toLowerCase().replace(/\s+/g, "") === lower) return h;
  }
  return null;
}

export function validateRequiredColumns(
  headers: string[]
): ValidationIssue[] {
  const missing: string[] = [];
  for (const col of REQUIRED_COLUMNS) {
    if (!findHeader(headers, col)) missing.push(col);
  }
  if (missing.length === 0) return [];
  return [
    {
      type: "error",
      title: "Missing required columns",
      description: `The following columns are required for Matrixify: ${missing.join(", ")}.`,
      suggestion: "Add the missing columns to your CSV header row.",
      fix: {
        type: "add_columns",
        payload: { columnNames: [...missing] },
      },
    },
  ];
}

export function validateDuplicateSkus(
  headers: string[],
  rows: Record<string, string>[]
): ValidationIssue[] {
  const skuKey = getHeaderKey(headers, "Variant SKU");
  if (!skuKey) return [];

  const skuToRows = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const sku = (row[skuKey] ?? "").trim();
    if (sku === "") return;
    const list = skuToRows.get(sku) ?? [];
    list.push(index + 2);
    skuToRows.set(sku, list);
  });

  const duplicates: { sku: string; rows: number[] }[] = [];
  skuToRows.forEach((rowNums, sku) => {
    if (rowNums.length > 1) duplicates.push({ sku, rows: rowNums });
  });

  if (duplicates.length === 0) return [];
  const description = duplicates
    .map((d) => `"${d.sku}" (rows: ${d.rows.join(", ")})`)
    .join("; ");
  return [
    {
      type: "error",
      title: "Duplicate Variant SKU",
      description: `Duplicate SKU values found: ${description}.`,
      rows: duplicates.flatMap((d) => d.rows),
      suggestion: "Ensure each variant has a unique Variant SKU.",
    },
  ];
}

export function validateMissingOptionValues(
  headers: string[],
  rows: Record<string, string>[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const option1NameKey = getHeaderKey(headers, "Option1 Name");
  const option1ValueKey = getHeaderKey(headers, "Option1 Value");
  const option2NameKey = getHeaderKey(headers, "Option2 Name");
  const option2ValueKey = getHeaderKey(headers, "Option2 Value");

  if (option1NameKey && option1ValueKey) {
    const rowsWithMissing: number[] = [];
    rows.forEach((row, index) => {
      const name = (row[option1NameKey] ?? "").trim();
      const value = (row[option1ValueKey] ?? "").trim();
      if (name !== "" && value === "") rowsWithMissing.push(index + 2);
    });
    if (rowsWithMissing.length > 0) {
      issues.push({
        type: "warning",
        title: "Missing Option1 Value",
        description: `Option1 Name is set but Option1 Value is empty in ${rowsWithMissing.length} row(s).`,
        rows: rowsWithMissing,
        suggestion: "Fill Option1 Value when Option1 Name is present.",
      });
    }
  }

  if (option2NameKey && option2ValueKey) {
    const rowsWithMissing: number[] = [];
    rows.forEach((row, index) => {
      const name = (row[option2NameKey] ?? "").trim();
      const value = (row[option2ValueKey] ?? "").trim();
      if (name !== "" && value === "") rowsWithMissing.push(index + 2);
    });
    if (rowsWithMissing.length > 0) {
      issues.push({
        type: "warning",
        title: "Missing Option2 Value",
        description: `Option2 Name is set but Option2 Value is empty in ${rowsWithMissing.length} row(s).`,
        rows: rowsWithMissing,
        suggestion: "Fill Option2 Value when Option2 Name is present.",
      });
    }
  }

  return issues;
}

export function validateEmptyHandleWithMultipleVariants(
  headers: string[],
  rows: Record<string, string>[]
): ValidationIssue[] {
  const handleKey = getHeaderKey(headers, "Handle");
  const titleKey = getHeaderKey(headers, "Title");
  if (!handleKey || !titleKey) return [];

  const titleToRows = new Map<string, { rowIndex: number; handle: string }[]>();
  rows.forEach((row, index) => {
    const title = (row[titleKey] ?? "").trim();
    const handle = (row[handleKey] ?? "").trim();
    const list = titleToRows.get(title) ?? [];
    list.push({ rowIndex: index + 2, handle });
    titleToRows.set(title, list);
  });

  const affectedRows: number[] = [];
  titleToRows.forEach((list) => {
    if (list.length <= 1) return;
    const hasEmpty = list.some((r) => r.handle === "");
    if (hasEmpty) list.forEach((r) => affectedRows.push(r.rowIndex));
  });

  if (affectedRows.length === 0) return [];
  return [
    {
      type: "error",
      title: "Empty Handle with multiple variants",
      description:
        "Variants require consistent Handle value. Some rows share the same Title but have an empty Handle.",
      rows: Array.from(new Set(affectedRows)),
      suggestion: "Set the same non-empty Handle for all rows that share a Title.",
    },
  ];
}

/** Control chars except tab, CR, LF; zero-width; BOM */
const SPECIAL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\uFEFF\u200B-\u200D\u2060\u00AD]/u;

function hasSpecialChars(s: string): boolean {
  return SPECIAL_CHAR_REGEX.test(s);
}

export function validateSpecialCharacters(
  headers: string[],
  rows: Record<string, string>[]
): ValidationIssue[] {
  const affectedRows = new Set<number>();
  rows.forEach((row, index) => {
    for (const key of headers) {
      const value = row[key] ?? "";
      if (hasSpecialChars(value)) {
        affectedRows.add(index + 2);
        break;
      }
    }
  });
  if (affectedRows.size === 0) return [];
  return [
    {
      type: "warning",
      title: "Special characters detected",
      description: `Control or non-printable characters found in ${affectedRows.size} row(s), which may break imports.`,
      rows: Array.from(affectedRows),
      suggestion: "Remove or replace special characters in the listed cells.",
      fix: { type: "clean_special_chars", payload: {} },
    },
  ];
}

export function validateColumnNameMismatch(headers: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const header of headers) {
    const normalized = header.toLowerCase().replace(/\s+/g, "");
    const withSpaces = header.toLowerCase();
    const suggested = TYPO_MAP[withSpaces] ?? TYPO_MAP[normalized];
    if (suggested && header !== suggested) {
      issues.push({
        type: "warning",
        title: "Column name may be incorrect",
        description: `Column "${header}" might be a typo.`,
        suggestion: `Use "${suggested}" for Matrixify compatibility.`,
        fix: {
          type: "rename_header",
          payload: { from: header, to: suggested },
        },
      });
    }
  }
  return issues;
}

export function runAllValidators(
  headers: string[],
  rows: Record<string, string>[]
): ValidationIssue[] {
  const results: ValidationIssue[] = [];
  results.push(...validateRequiredColumns(headers));
  results.push(...validateDuplicateSkus(headers, rows));
  results.push(...validateMissingOptionValues(headers, rows));
  results.push(...validateEmptyHandleWithMultipleVariants(headers, rows));
  results.push(...validateSpecialCharacters(headers, rows));
  results.push(...validateColumnNameMismatch(headers));
  return results;
}
