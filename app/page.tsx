import Link from "next/link";
import { FileSpreadsheet, Scissors, Layers, Merge, BookOpen } from "lucide-react";

const features = [
  {
    title: "Validate CSV",
    description: "Upload your Matrixify CSV and catch errors before import. Required columns, duplicate SKUs, broken image URLs, encoding issues, and more—with one-click fixes.",
    href: "/validate",
    icon: FileSpreadsheet,
  },
  {
    title: "Split large files",
    description: "Split big CSVs into smaller chunks by row count. Download as a single ZIP or per-chunk. Handy for Matrixify and API limits.",
    href: "/split",
    icon: Scissors,
  },
  {
    title: "Metafields Wizard",
    description: "Add custom metafields and generate a valid Matrixify template. Pick namespace, key, and type; get a CSV ready for import.",
    href: "/metafields",
    icon: Layers,
  },
  {
    title: "Dashboard & merge",
    description: "Save a store snapshot from a full export, then merge update CSVs (primary key + changed columns only) without re-uploading everything.",
    href: "/dashboard",
    icon: Merge,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 sm:py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Fix Matrixify imports before you upload
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Validate CSVs, split large files, build metafield templates, and merge updates with store snapshots—all in one place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/validate"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Validate a CSV
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookOpen className="h-5 w-5" />
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            What you can do
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Tools for Shopify Matrixify CSV: validate, fix, split, and merge.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-muted/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-foreground group-hover:underline">
                    Open {feature.title} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            Documentation
          </Link>
          <span className="mx-2">·</span>
          <Link href="/validate" className="hover:text-foreground">
            Validate
          </Link>
          <span className="mx-2">·</span>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
