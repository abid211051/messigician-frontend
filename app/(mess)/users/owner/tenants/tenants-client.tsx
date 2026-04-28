"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Trash2, Users, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import TenantCard from "./tenant-card";
import SubMessFilter from "./sub-mess-filter";
import ListLoading from "@/components/ui/ListLoading";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import DataPagination from "@/components/reusable/data-pagination";
import { TenantData, SubMessOption } from "./types";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 5;

// ─── URL param keys (single source of truth) ────────────────────────────────
const PARAM_PAGE = "page";
const PARAM_SUB_MESS = "sub_mess"; // comma-separated IDs

// ─── Data layer ─────────────────────────────────────────────────────────────
// All fetch logic is isolated here. To move to a real backend:
//   1. Replace the body of this function with an actual fetch() call.
//   2. Pass `page` and `subMessIds` to the API as query params.
//   3. Return `{ tenants, subMesses, totalItems }` from the API response.
//   4. Remove the local filter/slice below — the server does that.
interface FetchParams {
  messId: string | undefined;
  page: number;
  pageSize: number;
  subMessIds: Set<string>;
}

interface FetchResult {
  tenants: TenantData[];
  subMesses: SubMessOption[];
  totalItems: number;
}

async function fetchTenants({
  messId, // eslint-disable-line @typescript-eslint/no-unused-vars
  page,
  pageSize,
  subMessIds,
}: FetchParams): Promise<FetchResult> {
  // ── MOCK (replace this block with a real fetch) ──────────────────────────
  await new Promise((r) => setTimeout(r, 400));

  const allSubMesses: SubMessOption[] = [
    { id: "1", name: "Block-1" },
    { id: "2", name: "Block-2" },
    { id: "3", name: "Building A" },
  ];

  const allTenants: TenantData[] = [
    {
      id: "1",
      user_id: "u1",
      fname: "John Doe",
      email: "john@example.com",
      phone: "+880123456789",
      sub_mess_id: "1",
      sub_mess_name: "Block-1",
      rent_amount: 5000,
      image_url: null,
    },
    {
      id: "2",
      user_id: "u2",
      fname: "Jane Smith",
      email: "jane@example.com",
      phone: null,
      sub_mess_id: "2",
      sub_mess_name: "Block-2",
      rent_amount: 6500,
      image_url: null,
    },
    {
      id: "3",
      user_id: "u3",
      fname: "Mike Johnson",
      email: "mike@example.com",
      phone: "+880555666777",
      sub_mess_id: "1",
      sub_mess_name: "Block-1",
      rent_amount: 4500,
      image_url: null,
    },
    {
      id: "4",
      user_id: "u4",
      fname: "Sara Ahmed",
      email: "sara@example.com",
      phone: "+880111222333",
      sub_mess_id: "2",
      sub_mess_name: "Block-2",
      rent_amount: 5500,
      image_url: null,
    },
    {
      id: "5",
      user_id: "u5",
      fname: "Rafiq Islam",
      email: "rafiq@example.com",
      phone: "+880444555666",
      sub_mess_id: "3",
      sub_mess_name: "Building A",
      rent_amount: 7000,
      image_url: null,
    },
    {
      id: "6",
      user_id: "u6",
      fname: "Nadia Begum",
      email: "nadia@example.com",
      phone: null,
      sub_mess_id: "1",
      sub_mess_name: "Block-1",
      rent_amount: 4800,
      image_url: null,
    },
    {
      id: "7",
      user_id: "u7",
      fname: "Karim Uddin",
      email: "karim@example.com",
      phone: "+880777888999",
      sub_mess_id: "3",
      sub_mess_name: "Building A",
      rent_amount: 6200,
      image_url: null,
    },
  ];

  // Mock server-side filter + pagination
  const filtered =
    subMessIds.size === 0
      ? allTenants
      : allTenants.filter((t) => subMessIds.has(t.sub_mess_id));

  const totalItems = filtered.length;
  const tenants = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { tenants, subMesses: allSubMesses, totalItems };
  // ── END MOCK ─────────────────────────────────────────────────────────────
}

// ─── URL helpers ─────────────────────────────────────────────────────────────
function parseUrlState(searchParams: URLSearchParams) {
  const rawPage = parseInt(searchParams.get(PARAM_PAGE) ?? "1", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawSubMess = searchParams.get(PARAM_SUB_MESS);
  const subMessIds = rawSubMess
    ? new Set(rawSubMess.split(",").filter(Boolean))
    : new Set<string>();

  return { page, subMessIds };
}

function buildUrl(
  pathname: string,
  page: number,
  subMessIds: Set<string>,
): string {
  const params = new URLSearchParams();
  // Only write non-default values to keep URL clean
  if (page > 1) params.set(PARAM_PAGE, String(page));
  if (subMessIds.size > 0)
    params.set(PARAM_SUB_MESS, [...subMessIds].join(","));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TenantsClient() {
  const messId = useAuthStore((s) => s.user?.mess_id);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Boot state directly from URL — no two sources of truth
  const { page: initialPage, subMessIds: initialSubMess } =
    parseUrlState(searchParams);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filteredSubMesses, setFilteredSubMesses] =
    useState<Set<string>>(initialSubMess);

  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [subMesses, setSubMesses] = useState<SubMessOption[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, startLoading] = useTransition();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Single fetch trigger — called whenever page or filter changes ──────────
  const loadData = useCallback(
    (page: number, subMessIds: Set<string>) => {
      startLoading(async () => {
        const data = await fetchTenants({
          messId,
          page,
          pageSize: PAGE_SIZE,
          subMessIds,
        });
        setTenants(data.tenants);
        setSubMesses(data.subMesses);
        setTotalItems(data.totalItems);
        // Clear selections when data changes
        setSelectedIds(new Set());
      });
    },
    [messId],
  );

  // Initial load
  useEffect(() => {
    loadData(initialPage, initialSubMess);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── State + URL change helpers ────────────────────────────────────────────
  // Single function that always keeps state, URL, and data in sync
  const applyChange = useCallback(
    (nextPage: number, nextSubMess: Set<string>) => {
      setCurrentPage(nextPage);
      setFilteredSubMesses(nextSubMess);
      router.replace(buildUrl(pathname, nextPage, nextSubMess), {
        scroll: false,
      });
      loadData(nextPage, nextSubMess);
    },
    [router, pathname, loadData],
  );

  const handlePageChange = (page: number) =>
    applyChange(page, filteredSubMesses);

  const handleToggleSubMess = (id: string) => {
    const next = new Set(filteredSubMesses);
    next.has(id) ? next.delete(id) : next.add(id);
    applyChange(1, next); // always reset to page 1 on filter change
  };

  const handleClearFilter = () => applyChange(1, new Set());

  // ── Selection ─────────────────────────────────────────────────────────────
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

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: await deleteTenantsApi(Array.from(selectedIds));
      await new Promise((r) => setTimeout(r, 700));
      setConfirmOpen(false);
      setSelectedIds(new Set());
      // Reload current page — item count may have changed
      loadData(currentPage, filteredSubMesses);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading && tenants.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(PAGE_SIZE)].map((_, i) => (
          <ListLoading key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter */}
      <div className="mb-3">
        <SubMessFilter
          subMesses={subMesses}
          selectedIds={filteredSubMesses}
          onToggle={handleToggleSubMess}
          onClear={handleClearFilter}
        />
      </div>

      {!isLoading && totalItems === 0 ? (
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
                onClick={() => setConfirmOpen(true)}
                className="h-7 text-xs px-3 gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>

          {/* Cards — dim during reload */}
          <div
            className={`space-y-2.5 transition-opacity ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                isSelected={selectedIds.has(tenant.id)}
                onSelect={(checked) => handleSelectOne(tenant.id, checked)}
                onEdit={(id) => console.log("Edit", id)}
                onDelete={(id) => console.log("Delete", id)}
              />
            ))}
          </div>

          {/* Pagination */}
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
        title={`Delete ${selectedIds.size} tenant${selectedIds.size !== 1 ? "s" : ""}?`}
        description="This will permanently remove the selected tenants. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleBulkDelete}
      />
    </>
  );
}
