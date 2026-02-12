import Link from "next/link";

export const metadata = {
  title: "Documentation – Matrixify Helper",
  description: "How to use Matrixify Helper: validate CSV, split files, metafields wizard, and merge updates.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl space-y-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Documentation
          </h1>
          <p className="mt-2 text-muted-foreground">
            How each tool works and how to use it with Shopify Matrixify.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Introduction</h2>
          <p className="text-muted-foreground">
            Matrixify Helper helps you prepare and fix Shopify Matrixify CSV files before uploading. You can validate for common errors, split large files, build metafield templates, and merge update-only CSVs with a saved store snapshot.
          </p>
          <p className="text-muted-foreground">
            All tools run in your browser or on our server; your CSV data is only sent to our APIs for validation and image checks. When you sign in, snapshots and merge use your account and our database to store one snapshot per user.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            <Link href="/validate" className="hover:underline">Validate CSV</Link>
          </h2>
          <p className="text-muted-foreground">
            Upload a Matrixify-format CSV and get an instant report of issues. The validator checks for:
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li><strong>Required columns</strong> – Handle, Title, Variant SKU, Option1 Name, Option1 Value must exist (with flexible name matching).</li>
            <li><strong>Duplicate SKUs</strong> – Same Variant SKU in more than one row.</li>
            <li><strong>Missing option values</strong> – Rows with Option name set but empty Option value.</li>
            <li><strong>Empty handle with multiple variants</strong> – Product rows that need a Handle.</li>
            <li><strong>Column name mismatches</strong> – Typos or wrong casing (e.g. variant sku vs Variant SKU).</li>
            <li><strong>Encoding</strong> – Non-UTF-8 files; we suggest re-encoding and can re-decode on the client.</li>
            <li><strong>Special characters</strong> – Problematic characters in cells.</li>
            <li><strong>Broken image URLs</strong> – Image Src and Variant Image URLs are checked; failed ones can be cleared with one click.</li>
          </ul>
          <p className="text-muted-foreground">
            You can <strong>map columns</strong> to canonical Matrixify names (with saved profiles), <strong>apply one-click fixes</strong> where offered, edit cells inline, and <strong>download the fixed CSV</strong>. If you’re signed in, you can also <strong>Save as store snapshot</strong> for use in the Dashboard merge tool.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            <Link href="/split" className="hover:underline">Split large files</Link>
          </h2>
          <p className="text-muted-foreground">
            Use this when your CSV is too large to upload in one go or you want to process it in batches. Choose a <strong>max rows per chunk</strong> (default 10,000). The tool splits the file into multiple CSVs, each with the same header row. You can download <strong>all chunks as a single ZIP</strong> or each chunk separately. File size limit for the splitter is 50 MB.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            <Link href="/metafields" className="hover:underline">Metafields Wizard</Link>
          </h2>
          <p className="text-muted-foreground">
            Matrixify expects metafield columns in the form <code className="rounded bg-muted px-1 py-0.5 text-sm text-foreground">Metafield: namespace.key [type]</code> (e.g. <code className="rounded bg-muted px-1 py-0.5 text-sm text-foreground">Metafield: custom.colour [single_line_text_field]</code>). The wizard lets you:
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Add metafields by <strong>namespace</strong>, <strong>key</strong>, and <strong>type</strong> (from Shopify’s supported types).</li>
            <li>Optionally map from an existing CSV column when you have a validated file open on the Validate page.</li>
            <li><strong>Generate a template CSV</strong> with standard Matrixify columns plus your metafield columns (with one empty row), ready to fill and import.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            <Link href="/dashboard" className="hover:underline">Dashboard and merge</Link>
          </h2>
          <p className="text-muted-foreground">
            Sign in to use the Dashboard. You can:
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li><strong>Save a store snapshot</strong> – After validating a full export CSV on the Validate page, click “Save as store snapshot” and give it a name. That CSV (headers + rows) is stored under your account.</li>
            <li><strong>Merge an update CSV</strong> – Upload a small CSV that contains only the <strong>primary key</strong> (e.g. Handle or Variant SKU) and the columns you changed. Select the snapshot to merge into and the primary key. The tool looks up each row in the snapshot by that key and overlays your updates, then outputs a full CSV with all columns. You can download the merged file.</li>
          </ul>
          <p className="text-muted-foreground">
            This way you don’t need to re-export the whole store for small updates; you only need the key and the changed fields.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Navigation</h2>
          <p className="text-muted-foreground">
            Use the top navigation to open <strong>Home</strong>, <strong>Validate</strong>, <strong>Split</strong>, <strong>Metafields</strong>, <strong>Dashboard</strong>, and <strong>Docs</strong>. Sign in to save snapshots and use the merge tool.
          </p>
        </section>
      </article>
    </div>
  );
}
