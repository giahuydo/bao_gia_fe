import { CompanySettingsForm } from "@/components/settings/company-settings-form";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Company Settings
      </h1>
      <CompanySettingsForm />
    </div>
  );
}
