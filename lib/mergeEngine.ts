/**
 * Merge an update CSV (primary key + changed columns only) into a full snapshot.
 * For each update row, find the snapshot row by primary key and overlay update values.
 */

export type MergeResult = {
  mergedRows: Record<string, string>[];
  mergedHeaders: string[];
  keysNotFound: string[];
};

/**
 * Merge update rows into snapshot by primary key. Snapshot headers define the output shape.
 * Update rows overwrite snapshot values for columns present in updateHeaders.
 */
export function mergeUpdateIntoSnapshot(
  snapshotRows: Record<string, string>[],
  snapshotHeaders: string[],
  updateRows: Record<string, string>[],
  updateHeaders: string[],
  primaryKey: string
): MergeResult {
  if (!snapshotHeaders.includes(primaryKey)) {
    throw new Error(`Primary key "${primaryKey}" not found in snapshot headers.`);
  }

  const keyToSnapshotRow = new Map<string, Record<string, string>>();
  for (const row of snapshotRows) {
    const key = row[primaryKey];
    if (key !== undefined && key !== "") {
      keyToSnapshotRow.set(String(key).trim(), { ...row });
    }
  }

  const keysNotFound: string[] = [];
  const mergedRows: Record<string, string>[] = [];

  for (const updateRow of updateRows) {
    const key = updateRow[primaryKey];
    if (key === undefined || key === "") continue;
    const keyStr = String(key).trim();
    const baseRow = keyToSnapshotRow.get(keyStr);
    if (!baseRow) {
      keysNotFound.push(keyStr);
      continue;
    }
    const merged: Record<string, string> = {};
    for (const h of snapshotHeaders) {
      merged[h] = updateHeaders.includes(h) && updateRow[h] !== undefined && updateRow[h] !== ""
        ? String(updateRow[h])
        : (baseRow[h] ?? "");
    }
    mergedRows.push(merged);
  }

  return {
    mergedRows,
    mergedHeaders: [...snapshotHeaders],
    keysNotFound,
  };
}
