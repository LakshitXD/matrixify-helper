import { FileUpload } from "@/components/FileUpload";

export default function ValidatePage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[900px] space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Validate CSV
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload your Matrixify CSV to check for errors and apply fixes before importing to Shopify.
          </p>
        </div>
        <FileUpload />
      </div>
    </div>
  );
}
