import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import SubMessSelector from "./sub-mess-selector";

export default function OwnerPanelPage() {
  return (
    <div className={`pb-24 ${SYSTEM_WIDE_PADDING}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <SubMessSelector />

        <div className="text-right shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-0.5">
            Overview
          </p>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            Root Mess Level
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 mb-3" />

      <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 text-center">
        <p className="text-sm text-gray-500">
          Mess-wide statistics and panels will display here.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Select a sub-mess above to view its member panel.
        </p>
      </div>
    </div>
  );
}
