export type ValidationIssue = {
  type: "error" | "warning";
  title: string;
  description: string;
  rows?: number[];
  suggestion?: string;
};

export type ValidationResponse = {
  success: boolean;
  issues: ValidationIssue[];
  message?: string;
  /** Parsed CSV data for table view; only present when parse succeeded */
  headers?: string[];
  rows?: Record<string, string>[];
};
