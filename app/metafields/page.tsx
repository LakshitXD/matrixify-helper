import { MetafieldsWizard } from "@/components/MetafieldsWizard";

export default function MetafieldsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[900px] space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Metafields Wizard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Add custom metafields and generate a Matrixify CSV template with valid metafield columns.
          </p>
        </div>
        <MetafieldsWizard existingHeaders={[]} />
      </div>
    </div>
  );
}
