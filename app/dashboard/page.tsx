import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { DashboardHeader } from "@/components/DashboardHeader";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }
  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[900px] space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-base text-neutral-600 sm:text-lg">
              Store snapshots and merge update CSVs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600">{session.user.email}</span>
            <Link
              href="/"
              className="text-sm font-medium text-primary underline hover:no-underline"
            >
              Validator
            </Link>
            <DashboardHeader />
          </div>
        </header>
        <DashboardClient />
      </div>
    </div>
  );
}
