"use client";

import { signOut } from "next-auth/react";

export function DashboardHeader() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
    >
      Sign out
    </button>
  );
}
