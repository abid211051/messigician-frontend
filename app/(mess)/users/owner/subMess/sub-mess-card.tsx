"use client";

import {
  Building2,
  Users,
  Armchair,
  Banknote,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SubMessData } from "./types";

interface SubMessCardProps {
  subMess: SubMessData;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (subMess: SubMessData) => void;
  onDelete: (id: string) => void;
}

export default function SubMessCard({
  subMess,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: SubMessCardProps) {
  const occupancyPercent =
    subMess.no_of_seats > 0
      ? Math.min(
          100,
          Math.round(
            (Number(subMess.no_of_members) / subMess.no_of_seats) * 100,
          ),
        )
      : 0;

  const isFull = occupancyPercent >= 100;

  return (
    <div
      className={`rounded-xl border bg-white transition-colors overflow-hidden ${
        isSelected ? "border-brand-primary/70" : "border-gray-200"
      }`}
    >
      <div className="p-3">
        {/* Top row: icon + name + checkbox */}
        <div className="flex items-start gap-2.5">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4.5 h-4.5 text-blue-500" />
          </div>

          {/* Name + utility */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
              {subMess.sub_mess_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Banknote className="w-3 h-3 shrink-0" />
              <span>
                ৳ {Number(subMess.total_rent).toLocaleString()} rent
                {Number(subMess.total_utility) > 0 && (
                  <span className="ml-1 text-gray-400">
                    + ৳ {Number(subMess.total_utility).toLocaleString()} utility
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Checkbox */}
          <div className="shrink-0 pt-0.5">
            <Checkbox
              className="border-brand-secondary/50"
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Select ${subMess.sub_mess_name}`}
            />
          </div>
        </div>

        {/* Bottom strip: seats/members + three-dot */}
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Members */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3 shrink-0" />
              <span>
                <span className="font-medium text-gray-700">
                  {subMess.no_of_members}
                </span>
                /{subMess.no_of_seats} members
              </span>
            </div>

            {/* Occupancy badge */}
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isFull
                  ? "bg-red-50 text-red-500"
                  : occupancyPercent > 70
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
              }`}
            >
              {isFull ? "Full" : `${occupancyPercent}%`}
            </span>
          </div>

          {/* Three-dot */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:text-gray-600 -mr-1"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(subMess)}>
                <Pencil className="w-3.5 h-3.5 mr-2 text-gray-700" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(subMess.id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
