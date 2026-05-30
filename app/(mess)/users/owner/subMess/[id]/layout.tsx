import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import { Building2, LogOut } from "lucide-react";
import Link from "next/link";
import { fetchSingleSubMess } from "../action";
import { handleApiError } from "@/lib/helpers/errors";
import PageSkeleton from "@/components/reusable/loading-skeleton";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function OwnerSubMessLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  let loading = true;
  let subMessName = "Loading...";
  try {
    const subMess = await fetchSingleSubMess(id);
    subMessName = subMess?.sub_mess_name ?? "Unknown";
    loading = false;
  } catch (error) {
    handleApiError(error);
    subMessName = "Failed to load";
    loading = false;
  }

  return (
    <div className={`relative w-full ${SYSTEM_WIDE_PADDING}`}>
      <div className="flex items-center justify-between gap-2 mb-3 pr-12">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">
              {subMessName}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 mb-3" />

      <div className="absolute top-2 right-3 z-30">
        <Link
          href="/users/owner"
          className="w-9 h-9 flex items-center justify-center rounded-full border
              border-red-200 bg-red-50 text-red-500 hover:bg-red-100 active:scale-95
              transition-all shrink-0 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Link>
      </div>
      {loading ? (
        <PageSkeleton count={6} />
      ) : (
        <main className="w-full">{children}</main>
      )}
    </div>
  );
}
