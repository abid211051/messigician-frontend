"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Building2,
  Trash2,
  Check,
  Search,
  ArrowUpDown,
  Plus,
  ArrowUp10,
  ArrowDown10,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import SubMessCard from "./sub-mess-card";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import DataPagination from "@/components/reusable/data-pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortBy, SortOrder, SubMessData } from "./types";
import {
  fetchSubMesses,
  deleteSubMesses,
  createSubMess,
  CreateSubMessBody,
} from "./actions";
import { handleApiError } from "@/lib/helpers/errors";
import PageSkeleton from "@/components/reusable/loading-skeleton";
import CreateSubMessDialog from "./sub-mess-create-dialog";
import {
  DEFAULT_PAGE_SIZE,
  PARAM_LIMIT,
  PARAM_PAGE,
  PARAM_SEARCH,
  PARAM_SORT_BY,
  PARAM_SORT_ORDER,
} from "@/lib/constants";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Date Created", value: "created_at" },
  { label: "Total Rent", value: "total_rent" },
  { label: "Members", value: "no_of_members" },
];

function parseUrlState(searchParams: URLSearchParams) {
  const rawPage = parseInt(searchParams.get(PARAM_PAGE) ?? "1", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const rawLimit = parseInt(searchParams.get(PARAM_LIMIT) ?? "", 10);
  const limit =
    isNaN(rawLimit) || rawLimit < 10 || rawLimit > 40
      ? DEFAULT_PAGE_SIZE
      : rawLimit;
  const search = searchParams.get(PARAM_SEARCH) ?? "";
  const sortBy = (searchParams.get(PARAM_SORT_BY) as SortBy) ?? "created_at";
  const sortOrder = (searchParams.get(PARAM_SORT_ORDER) as SortOrder) ?? "desc";
  return { page, limit, search, sortBy, sortOrder };
}

function buildUrl(
  pathname: string,
  page: number,
  limit: number,
  search: string,
  sortBy: SortBy,
  sortOrder: SortOrder,
) {
  const params = new URLSearchParams();
  if (page > 1) params.set(PARAM_PAGE, String(page));
  if (limit !== DEFAULT_PAGE_SIZE) params.set(PARAM_LIMIT, String(limit));
  if (search) params.set(PARAM_SEARCH, search);
  if (sortBy !== "created_at") params.set(PARAM_SORT_BY, sortBy);
  if (sortOrder !== "desc") params.set(PARAM_SORT_ORDER, sortOrder);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function SubMessClient() {
  const mess_id = useAuthStore((s) => s.user?.mess_id);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    page: initialPage,
    limit: initialLimit,
    search: initialSearch,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  } = parseUrlState(searchParams);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const [subMesses, setSubMesses] = useState<SubMessData[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [isLoading, startLoading] = useTransition();
  const [initialised, setInitialised] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Delete state ───────────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Create state ───────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (body: CreateSubMessBody) => {
    if (!mess_id) return;
    setIsCreating(true);
    try {
      await createSubMess(mess_id, body);
      setCreateOpen(false);
      // Reload page 1 so the new sub-mess is visible immediately
      applyChange(1, limit, search, sortBy, sortOrder);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsCreating(false);
    }
  };

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadSubMesses = useCallback(
    (
      page: number,
      limitVal: number,
      searchVal: string,
      sortByVal: SortBy,
      sortOrderVal: SortOrder,
    ) => {
      if (!mess_id) return;
      startLoading(async () => {
        try {
          const result = await fetchSubMesses({
            mess_id,
            page,
            limit: limitVal,
            search: searchVal,
            sortBy: sortByVal,
            sortOrder: sortOrderVal,
          });
          setSubMesses(result.data || []);
          setTotalItems(result.meta?.totalItems || 0);
          setCurrentPage(result.meta?.currentPage || page);
          setSelectedIds(new Set());
        } catch (error) {
          handleApiError(error);
          setSubMesses([]);
          setTotalItems(0);
        } finally {
          setInitialised(true);
        }
      });
    },
    [mess_id],
  );

  useEffect(() => {
    loadSubMesses(
      initialPage,
      initialLimit,
      initialSearch,
      initialSortBy,
      initialSortOrder,
    );
  }, [mess_id]);
  const applyChange = useCallback(
    (
      nextPage: number,
      nextLimit: number,
      nextSearch: string,
      nextSortBy: SortBy,
      nextSortOrder: SortOrder,
    ) => {
      setLimit(nextLimit);
      setSearch(nextSearch);
      setSortBy(nextSortBy);
      setSortOrder(nextSortOrder);
      router.replace(
        buildUrl(
          pathname,
          nextPage,
          nextLimit,
          nextSearch,
          nextSortBy,
          nextSortOrder,
        ),
        { scroll: false },
      );
      loadSubMesses(nextPage, nextLimit, nextSearch, nextSortBy, nextSortOrder);
    },
    [router, pathname, loadSubMesses],
  );

  const handlePageChange = (page: number) =>
    applyChange(page, limit, search, sortBy, sortOrder);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        applyChange(1, limit, searchInput, sortBy, sortOrder);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (newSortBy: SortBy) => {
    const newSortOrder =
      newSortBy === sortBy && sortOrder === "desc" ? "asc" : "desc";
    applyChange(1, limit, search, newSortBy, newSortOrder);
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  const allSelected =
    subMesses.length > 0 && subMesses.every((s) => selectedIds.has(s.id));
  const someSelected = subMesses.some((s) => selectedIds.has(s.id));

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      subMesses.forEach((s) => next.delete(s.id));
    } else {
      subMesses.forEach((s) => next.add(s.id));
    }
    setSelectedIds(next);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedIds(next);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleBulkDeleteClick = () => {
    setPendingDelete(new Set(selectedIds));
    setConfirmOpen(true);
  };

  const handleSingleDeleteClick = (id: string) => {
    setPendingDelete(new Set([id]));
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDelete.size === 0) return;
    setIsDeleting(true);
    try {
      await deleteSubMesses(pendingDelete);
      setConfirmOpen(false);
      setPendingDelete(new Set());
      setSelectedIds(new Set());
      loadSubMesses(currentPage, limit, search, sortBy, sortOrder);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (subMess: SubMessData) => {
    console.log("edit", subMess);
  };

  if (!mess_id || !initialised) {
    return <PageSkeleton count={10} />;
  }

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search sub-messes…"
            className="w-full pl-8 pr-3 h-9 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all"
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl text-xs shrink-0 border-gray-200"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span className="hidden sm:inline">{activeSortLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
              Sort by
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleSortChange(opt.value)}
                className="text-sm"
              >
                <span className="flex-1">{opt.label}</span>
                {sortBy === opt.value && (
                  <span className="text-xs text-gray-500 ml-2">
                    {sortOrder === "desc" ? <ArrowDown10 /> : <ArrowUp10 />}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="h-9 shrink-0 rounded-xl text-xs gap-1.5 px-2.5 sm:px-3"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>

      {/* ── List area ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <PageSkeleton count={10} />
      ) : totalItems === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-14 h-14 mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-700 mb-1">
            No sub-messes found
          </p>
          <p className="text-sm text-gray-400">
            {search
              ? "Try a different search term"
              : "Add a sub-mess to get started"}
          </p>
        </div>
      ) : (
        <>
          {/* Select-all bar */}
          <div className="min-h-7 flex items-center justify-between mb-2 px-0.5">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 group"
              aria-label="Select all"
            >
              <span
                className={`w-4.5 h-4.5 rounded-sm border-2 flex items-center justify-center transition-all shrink-0 ${
                  allSelected
                    ? "bg-blue-500 border-blue-500"
                    : someSelected
                      ? "bg-white border-blue-400"
                      : "bg-white border-gray-300 group-hover:border-gray-400"
                }`}
              >
                {allSelected && (
                  <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                )}
                {someSelected && !allSelected && (
                  <span className="w-2 h-0.5 bg-blue-400 rounded-full" />
                )}
              </span>
              <span className="text-xs text-gray-500 font-medium select-none">
                {selectedIds.size > 0
                  ? `${selectedIds.size} of ${totalItems} selected`
                  : `${totalItems} sub-mess${totalItems !== 1 ? "es" : ""}`}
              </span>
            </button>

            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
                className="h-7 text-xs px-3 gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
            {subMesses.map((subMess) => (
              <SubMessCard
                key={subMess.id}
                subMess={subMess}
                isSelected={selectedIds.has(subMess.id)}
                onSelect={(checked) => handleSelectOne(subMess.id, checked)}
                onEdit={handleEditClick}
                onDelete={handleSingleDeleteClick}
              />
            ))}
          </div>

          <DataPagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={limit}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${pendingDelete.size} sub-mess${pendingDelete.size !== 1 ? "es" : ""}?`}
        description="This action cannot be undone. Are you sure you want to proceed?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      <CreateSubMessDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isLoading={isCreating}
        onSave={handleCreate}
      />
    </>
  );
}
