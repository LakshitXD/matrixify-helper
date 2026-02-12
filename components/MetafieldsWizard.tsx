"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SHOPIFY_METAFIELD_TYPES,
  type MetafieldDef,
} from "@/lib/metafields";
import {
  buildMetafieldHeaders,
  buildTemplateCsv,
} from "@/lib/metafieldTemplate";
import { cn } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

const DEFAULT_NAMESPACE = "custom";

type MetafieldsWizardProps = {
  /** Optional: current CSV headers for "map from column" */
  existingHeaders?: string[];
};

export function MetafieldsWizard({ existingHeaders = [] }: MetafieldsWizardProps) {
  const [list, setList] = useState<MetafieldDef[]>([]);
  const [namespace, setNamespace] = useState(DEFAULT_NAMESPACE);
  const [key, setKey] = useState("");
  const [type, setType] = useState<string>(SHOPIFY_METAFIELD_TYPES[0]);
  const [mapFromColumn, setMapFromColumn] = useState<string>("");
  const [includeStandardColumns, setIncludeStandardColumns] = useState(true);

  const addMetafield = () => {
    const k = key.trim();
    if (!k) return;
    setList((prev) => [
      ...prev,
      {
        namespace: namespace.trim() || DEFAULT_NAMESPACE,
        key: k,
        type: type || SHOPIFY_METAFIELD_TYPES[0],
        ...(mapFromColumn ? { mapFromColumn } : {}),
      },
    ]);
    setKey("");
    setMapFromColumn("");
  };

  const removeMetafield = (index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateTemplate = () => {
    const metafieldHeaders = buildMetafieldHeaders(list);
    const csv = buildTemplateCsv(includeStandardColumns, metafieldHeaders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matrixify-metafields-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Metafields Wizard</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add custom metafields and generate a Matrixify CSV template with valid
          metafield columns.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-sm font-medium">Add metafield</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Namespace
              </label>
              <input
                type="text"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                placeholder="custom"
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                  "focus:outline-none focus:ring-1 focus:ring-ring"
                )}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. colour"
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                  "focus:outline-none focus:ring-1 focus:ring-ring"
                )}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Type
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHOPIFY_METAFIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {existingHeaders.length > 0 && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Map from column
                </label>
                <Select value={mapFromColumn} onValueChange={setMapFromColumn}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="New column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">New column</SelectItem>
                    {existingHeaders.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button type="button" size="sm" onClick={addMetafield}>
            <Plus className="h-4 w-4" />
            Add metafield
          </Button>
        </div>

        {list.length > 0 && (
          <>
            <div>
              <p className="mb-2 text-sm font-medium">Added metafields</p>
              <ul className="space-y-2">
                {list.map((m, i) => (
                  <li
                    key={`${m.namespace}.${m.key}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-muted-foreground">
                      {m.namespace}.{m.key}
                    </span>
                    <span className="text-muted-foreground">[{m.type}]</span>
                    {m.mapFromColumn && (
                      <span className="text-muted-foreground">
                        ← {m.mapFromColumn}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeMetafield(i)}
                      aria-label="Remove metafield"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeStandardColumns}
                  onChange={(e) => setIncludeStandardColumns(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                Include standard Matrixify columns
              </label>
              <Button onClick={handleGenerateTemplate}>
                Generate template CSV
              </Button>
            </div>
          </>
        )}

        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add at least one metafield (namespace, key, type) above, then
            generate a template to download a CSV with valid metafield headers.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
