"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Building2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/helpers/errors";
import PageSkeleton from "@/components/reusable/loading-skeleton";
import { fetchSubMesses } from "../../tenants/action";
import type { SubMessOption } from "../../tenants/types";
import { Button } from "@/components/ui/button";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";

interface Props {
  subMessId: string;
}

export default function SubMessPanelClient({ subMessId }: Props) {
  const mess_id = useAuthStore((s) => s.user?.mess_id);
  const router = useRouter();

  const [subMess, setSubMess] = useState<SubMessOption | null>(null);
  const [isPending, startLoading] = useTransition();
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!mess_id) return;
    startLoading(async () => {
      try {
        const all = await fetchSubMesses(mess_id);
        setSubMess(all.find((s) => s.id === subMessId) ?? null);
      } catch (err) {
        handleApiError(err);
      } finally {
        setInitialised(true);
      }
    });
  }, [mess_id, subMessId]);

  if (!initialised || isPending) return <PageSkeleton count={6} />;

  const name = subMess?.sub_mess_name ?? "Unknown";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">
              {name}
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/users/owner")}
          title="Back to mess overview"
          className="w-9 h-9 flex items-center justify-center rounded-full border
            border-red-200 bg-red-50 text-red-500 hover:bg-red-100 active:scale-95
            transition-all shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="h-px bg-gray-100 mb-3" />

      {/* ── Member-view frame ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 text-center">
        <p className="text-sm text-gray-500">
          Member-view content for{" "}
          <span className="font-semibold text-gray-700">{name}</span> loads
          here.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Meals, room info, and settings tabs will render in this frame.
        </p>
      </div>
    </div>
  );
}
