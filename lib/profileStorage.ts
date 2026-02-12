import type { MappingProfile } from "@/types/mapping";

const STORAGE_KEY = "matrixify-helper-profiles";

export function getProfiles(): MappingProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is MappingProfile =>
        p &&
        typeof p === "object" &&
        typeof (p as MappingProfile).name === "string" &&
        typeof (p as MappingProfile).mapping === "object"
    );
  } catch {
    return [];
  }
}

export function saveProfile(profile: MappingProfile): void {
  const list = getProfiles();
  const existing = list.findIndex((p) => p.name === profile.name);
  const withTimestamp = {
    ...profile,
    createdAt: profile.createdAt ?? new Date().toISOString(),
  };
  if (existing >= 0) {
    list[existing] = withTimestamp;
  } else {
    list.push(withTimestamp);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function deleteProfile(name: string): void {
  const list = getProfiles().filter((p) => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function exportProfilesToJson(): string {
  return JSON.stringify(getProfiles(), null, 2);
}

export function importProfilesFromJson(json: string): MappingProfile[] {
  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed)) return [];
  const valid = parsed.filter(
    (p): p is MappingProfile =>
      p &&
      typeof p === "object" &&
      typeof (p as MappingProfile).name === "string" &&
      typeof (p as MappingProfile).mapping === "object"
  );
  const existing = getProfiles();
  const merged = [...existing];
  for (const p of valid) {
    const idx = merged.findIndex((x) => x.name === p.name);
    const withTimestamp = {
      ...p,
      createdAt: (p as MappingProfile).createdAt ?? new Date().toISOString(),
    };
    if (idx >= 0) merged[idx] = withTimestamp;
    else merged.push(withTimestamp);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return getProfiles();
}
