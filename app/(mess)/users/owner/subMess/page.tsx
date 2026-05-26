import { Suspense } from "react";
import BackButton from "@/components/ui/back";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import SubMessClient from "./sub-mess-client";
import ListLoading from "@/components/ui/ListLoading";

export default function OwnerSubMessPage() {
  return (
    <div className={`min-h-screen pb-20 ${SYSTEM_WIDE_PADDING}`}>
      <div className="relative flex items-center justify-center py-2 mb-4">
        <BackButton />
        <h1 className="text-lg font-bold text-gray-900">Sub-Messes</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <ListLoading key={i} />
            ))}
          </div>
        }
      >
        <SubMessClient />
      </Suspense>
    </div>
  );
}
