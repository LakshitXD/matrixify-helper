"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SaveSnapshotButtonProps = {
  headers: string[];
  rows: Record<string, string>[];
  primaryKey?: string;
};

export function SaveSnapshotButton({
  headers,
  rows,
  primaryKey,
}: SaveSnapshotButtonProps) {
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (status === "loading") return null;
  if (!session) {
    return (
      <Link href="/auth/signin?callbackUrl=/">
        <Button variant="outline" size="sm">
          Sign in to save as store snapshot
        </Button>
      </Link>
    );
  }

  const handleSave = async () => {
    const name = window.prompt("Snapshot name", `Snapshot ${new Date().toISOString().slice(0, 10)}`);
    if (!name?.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          headers,
          rows,
          primaryKey: primaryKey ?? undefined,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save as store snapshot"}
      </Button>
      {saved && (
        <Link href="/dashboard" className="text-sm text-primary underline hover:no-underline">
          Open dashboard
        </Link>
      )}
    </div>
  );
}
