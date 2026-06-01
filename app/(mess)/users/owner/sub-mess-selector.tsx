"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/helpers/errors";
import { fetchSubMesses } from "./tenants/actions";
import type { SubMessOption } from "./tenants/types";

export default function SubMessSelector() {
  const mess_id = useAuthStore((s) => s.user?.mess_id);
  const router = useRouter();

  const [subMesses, setSubMesses] = useState<SubMessOption[]>([]);
  const [isPending, startLoading] = useTransition();
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!mess_id) return;
    startLoading(async () => {
      try {
        setSubMesses((await fetchSubMesses(mess_id)) ?? []);
      } catch (err) {
        handleApiError(err);
      } finally {
        setInitialised(true);
      }
    });
  }, [mess_id]);

  const handleSelect = (id: string) => {
    router.push(`/users/owner/subMess/${id}`);
  };

  const label = !initialised
    ? "Loading…"
    : subMesses.length === 0
      ? "No sub-messes"
      : "Select a Sub-Mess";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!initialised || isPending || subMesses.length === 0}
          className="group h-9 gap-1.5 rounded-xl text-xs font-medium shrink-0 border-gray-200 text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
          ) : (
            <Building2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="hidden sm:inline">{label}</span>

          <ChevronDown className="group-data-open:rotate-180 transition-transform w-3.5 h-3.5 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-xl">
        <DropdownMenuLabel className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-2 py-1">
          Sub-Mess List
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="overflow-y-auto max-h-52">
          {subMesses.map((sm) => (
            <DropdownMenuItem
              key={sm.id}
              onClick={() => handleSelect(sm.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{sm.sub_mess_name}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
