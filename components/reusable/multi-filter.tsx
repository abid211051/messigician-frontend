"use client";

import { useState } from "react";
import { Check, ChevronDown, X, LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export interface FilterOption {
  id: string;
  label: string;
  count?: number; // optional count badge like the screenshot
}

interface MultiFilterProps {
  label: string; // e.g. "Sub-Mess", "Status", "Role"
  icon?: LucideIcon; // optional leading icon
  options: FilterOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}

export default function MultiFilter({
  label,
  icon: Icon,
  options,
  selectedIds,
  onToggle,
  onClear,
}: MultiFilterProps) {
  const [open, setOpen] = useState(false);
  const count = selectedIds.size;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors focus:outline-none ${
            count > 0
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
          <span>{label}</span>
          {count > 0 ? (
            <Badge className="ml-0.5 h-4 min-w-4 px-1.5 text-[10px] bg-blue-500 text-white rounded-full">
              {count}
            </Badge>
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 p-1.5">
        {/* Label */}
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-2 pb-1.5 pt-0.5">
          {label}
        </p>

        <div className="space-y-0.5">
          {options.map((opt) => {
            const checked = selectedIds.has(opt.id);
            return (
              <div
                key={opt.id}
                role="button"
                onClick={() => onToggle(opt.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors select-none ${
                  checked
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(opt.id)}
                  className="pointer-events-none"
                />
                <span className="flex-1 text-left truncate">{opt.label}</span>
                {opt.count !== undefined && (
                  <span className="text-xs text-gray-400 tabular-nums">
                    {opt.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear */}
        {count > 0 && (
          <div className="mt-1 pt-1.5 border-t border-gray-100">
            <button
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filter
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
