import { FileUpload } from "@/components/FileUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[900px] space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Fix Your Matrixify Import Errors Before Uploading
          </h1>
          <p className="text-base text-neutral-600 sm:text-lg">
            Upload your CSV file and detect common Matrixify issues instantly.
          </p>
        </header>

        <main>
          <FileUpload />
        </main>
      </div>
    </div>
  );
}
