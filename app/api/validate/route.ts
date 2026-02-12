import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/csvParser";
import { runAllValidators } from "@/lib/validators";
import type { ValidationResponse } from "@/types/validation";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
];

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body", issues: [] },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "No file provided", issues: [] },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        success: false,
        message: "File too large. Maximum size is 10MB.",
        issues: [],
      },
      { status: 400 }
    );
  }

  const type = file.type.toLowerCase();
  const isCsvType = ALLOWED_TYPES.some((t) => type.includes(t) || type === t);
  const isCsvExtension = file.name.toLowerCase().endsWith(".csv");
  if (!isCsvType && !isCsvExtension) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid file type. Only CSV files are accepted.",
        issues: [],
      },
      { status: 400 }
    );
  }

  let csvString: string;
  try {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    csvString = decoder.decode(buffer);
  } catch {
    return NextResponse.json(
      {
        success: false,
        issues: [
          {
            type: "error",
            title: "File read error",
            description: "Could not read the file. Please try again.",
          },
        ],
      } satisfies ValidationResponse,
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  let headers: string[];
  let rows: Record<string, string>[];

  try {
    const parsed = parseCsv(csvString);
    headers = parsed.headers;
    rows = parsed.rows;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid CSV format.";
    return NextResponse.json(
      {
        success: false,
        issues: [
          {
            type: "error",
            title: "Parse error",
            description: message,
          },
        ],
      } satisfies ValidationResponse,
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const issues = runAllValidators(headers, rows);
  const hasError = issues.some((i) => i.type === "error");
  const response: ValidationResponse = {
    success: !hasError,
    issues,
    headers,
    rows,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
