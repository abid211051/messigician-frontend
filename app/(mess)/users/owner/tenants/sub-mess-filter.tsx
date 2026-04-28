"use client";

import { useState } from "react";
import { Building2, Check, ChevronDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SubMessOption } from "./types";

interface SubMessFilterProps {
  subMesses: SubMessOption[]; // pass WITHOUT the "all" entry
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}

export default function SubMessFilter({
  subMesses,
  selectedIds,
  onToggle,
  onClear,
}: SubMessFilterProps) {
  const [open, setOpen] = useState(false);
  const count = selectedIds.size;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            count > 0
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>Sub-Mess</span>
          {count > 0 ? (
            <Badge className="ml-0.5 h-4 px-1.5 text-[10px] bg-blue-500 text-white rounded-full">
              {count}
            </Badge>
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 p-1.5">
        {/* Search hint label */}
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-2 pb-1 pt-0.5">
          Sub-Mess
        </p>

        <div className="space-y-0.5">
          {subMesses.map((sm) => {
            const checked = selectedIds.has(sm.id);
            return (
              <div
                key={sm.id}
                onClick={() => onToggle(sm.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  checked
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(sm.id)}
                  className="pointer-events-none"
                />
                <span className="flex-1 text-left truncate">{sm.name}</span>
              </div>
            );
          })}
        </div>

        {/* Clear */}
        {count > 0 && (
          <button
            onClick={onClear}
            className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 pt-2"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
