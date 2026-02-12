import Papa from "papaparse";

export type ParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsv(csvString: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    throw new Error(
      firstError.message ?? `CSV parse error at row ${firstError.row}`
    );
  }

  const headers = result.meta.fields ?? [];
  const rows = result.data ?? [];

  return { headers, rows };
}
