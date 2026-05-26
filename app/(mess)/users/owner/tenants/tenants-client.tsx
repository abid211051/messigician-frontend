"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Trash2, Users, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import TenantCard from "./tenant-card";
import SubMessFilter from "./sub-mess-filter";
import PageSkeleton from "@/components/reusable/loading-skeleton";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import EditTenantDialog from "./tenant-edit-dialog";
import DataPagination from "@/components/reusable/data-pagination";
import { TenantData, SubMessOption } from "./types";
import { Button } from "@/components/ui/button";
import {
  fetchTenants,
  fetchSubMesses,
  deleteTenants,
  updateTenant,
} from "./action";
import { handleApiError } from "@/lib/helpers/errors";
import { EditTenantFormValues } from "./validation";

const PAGE_SIZE = 10;
const PARAM_PAGE = "page";
const PARAM_SUB_MESS = "sub_mess";

function parseUrlState(searchParams: URLSearchParams) {
  const rawPage = parseInt(searchParams.get(PARAM_PAGE) ?? "1", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const rawSubMess = searchParams.get(PARAM_SUB_MESS);
  const subMessIds = rawSubMess
    ? new Set(rawSubMess.split(",").filter(Boolean))
    : new Set<string>();
  return { page, subMessIds };
}

function buildUrl(pathname: string, page: number, subMessIds: Set<string>) {
  const params = new URLSearchParams();
  if (page > 1) params.set(PARAM_PAGE, String(page));
  if (subMessIds.size > 0)
    params.set(PARAM_SUB_MESS, [...subMessIds].join(","));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function TenantsClient() {
  const mess_id = useAuthStore((s) => s.user?.mess_id);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page: initialPage, subMessIds: initialSubMess } =
    parseUrlState(searchParams);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filteredSubMesses, setFilteredSubMesses] =
    useState<Set<string>>(initialSubMess);

  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [subMesses, setSubMesses] = useState<SubMessOption[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subMessFetchFailed, setSubMessFetchFailed] = useState(false);
  // ── Tracks whether the very first fetch has resolved ──────────────────────
  const [initialised, setInitialised] = useState(false);

  const [isLoading, startLoading] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Delete state ───────────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<TenantData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadTenants = useCallback(
    (page: number, sub_mess_ids: Set<string>) => {
      if (!mess_id) return;
      startLoading(async () => {
        try {
          const result = await fetchTenants({ mess_id, page, sub_mess_ids });
          setTenants(result.data || []);
          setTotalItems(result.meta?.totalItems || 0);
          setCurrentPage(result.meta?.currentPage || page);
          setSelectedIds(new Set());
        } catch (error) {
          handleApiError(error);
          setTenants([]);
          setTotalItems(0);
        }
      });
    },
    [mess_id],
  );

  // Initial load: sub-messes first, then tenants
  useEffect(() => {
    if (!mess_id) return;
    startLoading(async () => {
      try {
        const subMessData = await fetchSubMesses(mess_id);

        if (!subMessData || !subMessData.length) {
          setSubMesses([]);
          return;
        }

        setSubMesses(subMessData);

        const result = await fetchTenants({
          mess_id,
          page: initialPage,
          sub_mess_ids: initialSubMess,
        });
        setTenants(result.data || []);
        setTotalItems(result.meta?.totalItems || 0);
        setCurrentPage(result.meta?.currentPage || initialPage);
      } catch (error) {
        handleApiError(error);
        setSubMessFetchFailed(true);
      } finally {
        setInitialised(true); // ← always fires, even on error
      }
    });
  }, [mess_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL + filter + page sync ───────────────────────────────────────────────
  const applyChange = useCallback(
    (nextPage: number, nextSubMess: Set<string>) => {
      setFilteredSubMesses(nextSubMess);
      router.replace(buildUrl(pathname, nextPage, nextSubMess), {
        scroll: false,
      });
      loadTenants(nextPage, nextSubMess);
    },
    [router, pathname, loadTenants],
  );

  const handlePageChange = (page: number) =>
    applyChange(page, filteredSubMesses);

  const handleToggleSubMess = (id: string) => {
    const next = new Set(filteredSubMesses);
    next.has(id) ? next.delete(id) : next.add(id);
    applyChange(1, next);
  };

  const handleClearFilter = () => applyChange(1, new Set());

  // ── Selection ──────────────────────────────────────────────────────────────
  const allSelected =
    tenants.length > 0 && tenants.every((t) => selectedIds.has(t.id));
  const someSelected = tenants.some((t) => selectedIds.has(t.id));

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      tenants.forEach((t) => next.delete(t.id));
    } else {
      tenants.forEach((t) => next.add(t.id));
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
      await deleteTenants(pendingDelete);
      setConfirmOpen(false);
      setPendingDelete(new Set());
      setSelectedIds(new Set());
      loadTenants(currentPage, filteredSubMesses);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditClick = (tenant: TenantData) => {
    setPendingEdit(tenant);
    setEditOpen(true);
  };

  const handleSaveEdit = async (id: string, values: EditTenantFormValues) => {
    setIsSaving(true);
    try {
      await updateTenant(id, values);
      setEditOpen(false);
      setPendingEdit(null);
      loadTenants(currentPage, filteredSubMesses);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Initial full-page skeleton (before first fetch resolves) ───────────────
  if (!mess_id || !initialised) {
    return <PageSkeleton count={10} />;
  }

  // ── Error / empty sub-mess states (full-page, no cards possible) ───────────
  if (subMessFetchFailed || (!isLoading && subMesses.length === 0)) {
    return (
      <div className="text-center py-16">
        <Users className="w-14 h-14 mx-auto text-gray-200 mb-3" />
        <p className="font-semibold text-gray-700 mb-1">
          {subMessFetchFailed
            ? "Failed to load sub-messes"
            : "No sub-messes found"}
        </p>
        <p className="text-sm text-gray-400">
          {subMessFetchFailed
            ? "Please check your connection and try again"
            : "Add a sub-mess to get started"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter strip — always mounted after initialised */}
      <div className="mb-3">
        <SubMessFilter
          subMesses={subMesses}
          selectedIds={filteredSubMesses}
          onToggle={handleToggleSubMess}
          onClear={handleClearFilter}
        />
      </div>

      {/* List area — only this reacts to subsequent loads */}
      {isLoading ? (
        <PageSkeleton count={10} />
      ) : totalItems === 0 ? (
        <div className="text-center py-16">
          <Users className="w-14 h-14 mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-700 mb-1">No tenants found</p>
          <p className="text-sm text-gray-400">
            {filteredSubMesses.size > 0
              ? "No tenants in selected sub-messes"
              : "Add tenants to get started"}
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
                className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all shrink-0 ${
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
                  : `${totalItems} tenant${totalItems !== 1 ? "s" : ""}`}
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

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                isSelected={selectedIds.has(tenant.id)}
                onSelect={(checked) => handleSelectOne(tenant.id, checked)}
                onEdit={handleEditClick}
                onDelete={handleSingleDeleteClick}
              />
            ))}
          </div>

          <DataPagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${pendingDelete.size} tenant${pendingDelete.size !== 1 ? "s" : ""}?`}
        description="This action cannot be undone. Are you sure you want to proceed?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
      <EditTenantDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        tenant={pendingEdit}
        subMesses={subMesses}
        isLoading={isSaving}
        onSave={handleSaveEdit}
      />
    </>
  );
}
