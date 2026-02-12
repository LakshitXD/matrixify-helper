import Papa from "papaparse";
import { getCanonicalColumns } from "@/lib/fieldMapper";
import type { MetafieldDef } from "@/lib/metafields";
import { toMatrixifyHeader } from "@/lib/metafields";

/**
 * Build Matrixify metafield column headers from added metafields.
 */
export function buildMetafieldHeaders(addedMetafields: MetafieldDef[]): string[] {
  return addedMetafields.map((m) =>
    toMatrixifyHeader(m.namespace, m.key, m.type)
  );
}

/**
 * Build a CSV template with optional standard Matrixify columns + metafield columns.
 * One empty data row so the file is valid for Excel/import.
 */
export function buildTemplateCsv(
  includeStandardColumns: boolean,
  metafieldHeaders: string[]
): string {
  const standardHeaders = includeStandardColumns ? getCanonicalColumns() : [];
  const headers = [...standardHeaders, ...metafieldHeaders];
  const emptyRow = headers.reduce<Record<string, string>>((acc, h) => {
    acc[h] = "";
    return acc;
  }, {});
  return Papa.unparse({ fields: headers, data: [emptyRow] });
}
