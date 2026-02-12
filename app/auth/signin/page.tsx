"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Sign-in failed. Check that the database is connected and migrations have been run." : String(res.error));
        return;
      }
      if (res?.url) window.location.href = res.url;
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to save store snapshots and use the merge tool.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCredentialsSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                  "focus:outline-none focus:ring-1 focus:ring-ring"
                )}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                  "focus:outline-none focus:ring-1 focus:ring-ring"
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                With credentials, any email creates an account on first sign-in.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="underline hover:no-underline">
              Back to validator
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SignInForm />
    </Suspense>
  );
}

export default SignInPage;
