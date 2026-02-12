import { BulkSplitter } from "@/components/BulkSplitter";

export default function SplitPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[900px] space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Split large files
          </h1>
          <p className="mt-1 text-muted-foreground">
            Split a large CSV into smaller chunks by row count. Download as a single ZIP or as separate files.
          </p>
        </div>
        <BulkSplitter />
      </div>
    </div>
  );
}
