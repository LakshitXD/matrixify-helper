/** Log user action to our app (stored in DB when user is signed in). Application analytics only. */
export function logActivity(
  action: string,
  details?: Record<string, string | number | boolean | null | undefined>
): void {
  const safeDetails = details
    ? Object.fromEntries(
        Object.entries(details).filter(
          ([_, v]) =>
            v === null ||
            v === undefined ||
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
        )
      )
    : undefined;

  fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, details: safeDetails }),
  }).catch(() => {});
}
