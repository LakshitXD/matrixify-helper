/**
 * Detect if UTF-8 decoded content likely has encoding issues (replacement chars or mojibake).
 * Returns a suggested encoding for re-decode (e.g. windows-1252) or null if UTF-8 seems fine.
 */
export function detectEncodingIssue(utf8String: string): string | null {
  const replacementChar = "\uFFFD";
  if (utf8String.includes(replacementChar)) {
    return "windows-1252";
  }
  const mojibakePatterns = [
    /\u00C2\u00A0/g, // common UTF-8 misinterpretation of nbsp
    /\u00E2\u0080\u0099/g, // smart quote
    /\u00E2\u0080\u009C/g,
  ];
  const slice = utf8String.slice(0, 50000);
  for (const p of mojibakePatterns) {
    if (p.test(slice)) return "windows-1252";
  }
  return null;
}
