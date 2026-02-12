"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/validate", label: "Validate" },
  { href: "/split", label: "Split" },
  { href: "/metafields", label: "Metafields" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
];

function AvatarPlaceholder({ name, className }: { name?: string | null; className?: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-sm font-medium text-neutral-600",
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100">
          <span className="text-lg">Matrixify Helper</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-2 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {status === "loading" ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
          ) : session?.user ? (
            <>
              <AvatarPlaceholder name={session.user.name || session.user.email} className="dark:bg-neutral-700 dark:text-neutral-300" />
              <span className="hidden max-w-[120px] truncate text-sm text-neutral-600 dark:text-neutral-400 sm:inline">
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
