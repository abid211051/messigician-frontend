"use client";

import { useState, useEffect } from "react";
import { Trash2, Users, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import TenantCard from "./tenant-card";
import SubMessFilter from "./sub-mess-filter";
import ListLoading from "@/components/ui/ListLoading";
import { TenantData, SubMessOption } from "./types";
import { Button } from "@/components/ui/button";

export default function TenantsClient() {
  const messId = useAuthStore((s) => s.user?.mess_id);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [subMesses, setSubMesses] = useState<SubMessOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Multi-select filter — set of selected sub-mess IDs (empty = show all)
  const [filteredSubMesses, setFilteredSubMesses] = useState<Set<string>>(
    new Set(),
  );

  // Card selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setSubMesses([
      { id: "1", name: "Block-1" },
      { id: "2", name: "Block-2" },
      { id: "3", name: "Building A" },
    ]);
    setTenants([
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
    ]);
  }, [messId]);

  // Filter logic — empty set means "all"
  const filteredTenants = tenants.filter((t) =>
    filteredSubMesses.size === 0 ? true : filteredSubMesses.has(t.sub_mess_id),
  );

  const handleToggleSubMess = (id: string) => {
    const next = new Set(filteredSubMesses);
    next.has(id) ? next.delete(id) : next.add(id);
    setFilteredSubMesses(next);
  };

  // Card selection
  const allSelected =
    filteredTenants.length > 0 &&
    filteredTenants.every((t) => selectedIds.has(t.id));
  const someSelected = filteredTenants.some((t) => selectedIds.has(t.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTenants.map((t) => t.id)));
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("Deleting:", Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <ListLoading key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter row */}
      <div className="mb-3">
        <SubMessFilter
          subMesses={subMesses}
          selectedIds={filteredSubMesses}
          onToggle={handleToggleSubMess}
          onClear={() => setFilteredSubMesses(new Set())}
        />
      </div>

      {filteredTenants.length === 0 ? (
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
          {/* ── Select-all bar ── */}
          <div className="flex items-center justify-between mb-2 px-0.5">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 group"
              aria-label="Select all tenants"
            >
              {/* Custom visible checkbox */}
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
                {someSelected
                  ? `${selectedIds.size} of ${filteredTenants.length} selected`
                  : `${filteredTenants.length} tenant${filteredTenants.length !== 1 ? "s" : ""}`}
              </span>
            </button>

            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="h-7 text-xs px-3"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>

          {/* Cards */}
          <div className="space-y-2.5">
            {filteredTenants.map((tenant) => (
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
        </>
      )}
    </>
  );
}
