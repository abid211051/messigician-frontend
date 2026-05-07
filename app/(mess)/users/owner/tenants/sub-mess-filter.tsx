"use client";

import { Building2 } from "lucide-react";
import MultiFilter, { FilterOption } from "@/components/reusable/multi-filter";
import { SubMessOption } from "./types";

interface SubMessFilterProps {
  subMesses: SubMessOption[];
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
  const options: FilterOption[] = subMesses.map((sm) => ({
    id: sm.id,
    label: sm.sub_mess_name,
  }));

  return (
    <MultiFilter
      label="Sub-Mess"
      icon={Building2}
      options={options}
      selectedIds={selectedIds}
      onToggle={onToggle}
      onClear={onClear}
    />
  );
}
