import BackButton from "@/components/ui/back";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import TenantsClient from "./tenants-client";

export default function OwnerTenantsPage() {
  return (
    <div className={`min-h-screen pb-20 ${SYSTEM_WIDE_PADDING}`}>
      <div className="relative flex items-center justify-center py-2 mb-4">
        <BackButton />
        <h1 className="text-lg font-bold text-gray-900">Tenants</h1>
      </div>
      <TenantsClient />
    </div>
  );
}
