"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnMapping } from "@/types/mapping";
import type { MappingProfile } from "@/types/mapping";
import { getCanonicalColumns } from "@/lib/fieldMapper";
import { cn } from "@/lib/utils";

const DONOT_MAP = "__donotmap__";

type MappingEditorProps = {
  fileHeaders: string[];
  initialMapping: ColumnMapping;
  onApply: (mapping: ColumnMapping) => void;
  profiles?: MappingProfile[];
  onLoadProfile?: (profile: MappingProfile) => void;
  onSaveProfile?: (name: string, mapping: ColumnMapping) => void;
  onExportProfiles?: () => void;
  onImportProfiles?: (file: File) => void;
};

export function MappingEditor({
  fileHeaders,
  initialMapping,
  onApply,
  profiles = [],
  onLoadProfile,
  onSaveProfile,
  onExportProfiles,
  onImportProfiles,
}: MappingEditorProps) {
  const canonical = useMemo(() => getCanonicalColumns(), []);
  const [mapping, setMapping] = useState<ColumnMapping>(() => ({ ...initialMapping }));

  useEffect(() => {
    setMapping({ ...initialMapping });
  }, [fileHeaders.join(","), JSON.stringify(initialMapping)]);

  const handleSelect = (fileHeader: string, value: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (value === DONOT_MAP) {
        delete next[fileHeader];
      } else {
        next[fileHeader] = value;
      }
      return next;
    });
  };

  const handleApply = () => {
    const toApply: ColumnMapping = {};
    for (const h of fileHeaders) {
      const v = mapping[h];
      if (v && v !== DONOT_MAP) toApply[h] = v;
    }
    onApply(toApply);
  };

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Map fields</CardTitle>
        <p className="text-sm text-muted-foreground">
          Match your CSV columns to Matrixify column names. Apply mapping to rename and re-validate.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {profiles.length > 0 && onLoadProfile && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Load profile:</span>
            <Select
              onValueChange={(id) => {
                const p = profiles.find((x) => x.name === id);
                if (p) onLoadProfile(p);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choose a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {fileHeaders.map((h) => (
            <div
              key={h}
              className={cn(
                "flex flex-col gap-1.5 rounded-lg border border-border/80 bg-muted/30 p-3"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">
                Your column
              </span>
              <span className="truncate text-sm font-medium">{h}</span>
              <Select
                value={mapping[h] ?? DONOT_MAP}
                onValueChange={(v) => handleSelect(h, v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Don't map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DONOT_MAP}>Don't map</SelectItem>
                  {canonical.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleApply} size="sm">
            Apply mapping
          </Button>
          {onSaveProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = window.prompt("Profile name");
                if (name?.trim()) onSaveProfile(name.trim(), mapping);
              }}
            >
              Save as profile
            </Button>
          )}
          {onExportProfiles && (
            <Button variant="outline" size="sm" onClick={onExportProfiles}>
              Export profiles
            </Button>
          )}
          {onImportProfiles && (
            <>
              <input
                type="file"
                accept=".json"
                className="hidden"
                id="import-profiles"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportProfiles(f);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("import-profiles")?.click()
                }
              >
                Import profiles
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
