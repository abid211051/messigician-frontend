"use client";

import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function DataPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false,
}: DataPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const getPages = (): (number | "...")[] => {
    // Show all if small enough — no ellipsis needed
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // At first page: no left ellipsis, current IS 1 and At last page: no right ellipsis, current IS n
    if (currentPage === 1 || currentPage === totalPages) {
      return [1, "...", totalPages];
    }

    // Adjacent to first: show 1 and 2 together, no left ellipsis
    if (currentPage === 2) {
      return [1, 2, "...", totalPages];
    }
    // Adjacent to last: show n-1 and n together, no right ellipsis
    if (currentPage === totalPages - 1) {
      return [1, "...", totalPages - 1, totalPages];
    }
    // Middle: anchor both ends, show current in between
    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
      <p className="text-xs text-gray-400 tabular-nums">
        {from}–{to} of {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPages().map((page, i) =>
          page === "..." ? (
            <span
              key={`e${i}`}
              className="px-0.5 text-xs text-muted-foreground/90 select-none"
            >
              <Ellipsis className="h-3 w-3" />
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              disabled={isLoading}
              className={`h-7 min-w-[28px] px-1.5 rounded-md text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-brand-primary text-white"
                  : "text-muted-foreground/90 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
