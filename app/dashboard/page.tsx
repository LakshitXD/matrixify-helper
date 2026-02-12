import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }
  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[900px] space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Store snapshots and merge update CSVs.
          </p>
        </header>
        <DashboardClient />
      </div>
    </div>
  );
}
