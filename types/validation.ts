export type ValidationFixType =
  | "apply_encoding"
  | "rename_header"
  | "add_columns"
  | "clean_special_chars";

export type ValidationFixPayload = {
  apply_encoding?: { suggestedEncoding: string };
  rename_header?: { from: string; to: string };
  add_columns?: { columnNames: string[] };
  clean_special_chars?: Record<string, unknown>;
};

export type ValidationIssue = {
  type: "error" | "warning";
  title: string;
  description: string;
  rows?: number[];
  suggestion?: string;
  fix?: {
    type: ValidationFixType;
    payload?: ValidationFixPayload[keyof ValidationFixPayload];
  };
};

export type ValidationResponse = {
  success: boolean;
  issues: ValidationIssue[];
  message?: string;
  /** Parsed CSV data for table view; only present when parse succeeded */
  headers?: string[];
  rows?: Record<string, string>[];
  /** Set when encoding detection suggests a different encoding */
  suggestedEncoding?: string;
};
