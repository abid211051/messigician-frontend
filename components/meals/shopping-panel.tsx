// ── shopping-panel.tsx ────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/reusable/numeric-field";
import { handleApiError } from "@/lib/helpers/errors";
import {
  addShoppingEntry,
  deleteShoppingEntry,
  updateShoppingEntry,
} from "@/app/(meals)/actions";
import type { ShoppingEntry } from "@/app/(meals)/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  monthId: string;
  shopping: ShoppingEntry[];
  onRefresh: () => void;
}

export default function ShoppingPanel({
  open,
  onOpenChange,
  monthId,
  shopping,
  onRefresh,
}: Props) {
  const today = new Date().getDate();

  const [day, setDay] = useState<number | undefined>(today);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setDay(today);
    setAmount(undefined);
    setNote("");
  };

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setDay(today);
      setAmount(undefined);
      setNote("");
    }
  }, [open, today]);

  const handleSubmit = async () => {
    if (!day || !amount) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateShoppingEntry({
          id: editingId,
          meal_month_id: monthId,
          day_number: day,
          amount,
          note: note || undefined,
        });
      } else {
        await addShoppingEntry({
          meal_month_id: monthId,
          day_number: day,
          amount,
          note: note || undefined,
        });
      }
      resetForm();
      onRefresh();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShoppingEntry(id);
      onRefresh();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (entry: ShoppingEntry) => {
    setEditingId(entry.id);
    setDay(entry.day_number);
    setAmount(Number(entry.amount));
    setNote(entry.note ?? "");
  };

  // Group shopping entries by day for display
  const byDay = shopping.reduce<Record<number, ShoppingEntry[]>>((acc, s) => {
    (acc[s.day_number] ??= []).push(s);
    return acc;
  }, {});

  const total = shopping.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-4 pt-5 pb-3 border-b border-gray-100">
          <SheetTitle className="text-sm font-bold text-gray-900">
            Food Shopping
          </SheetTitle>
          <p className="text-xs text-gray-400">
            Total this month:{" "}
            <span className="font-semibold text-gray-700">
              ৳ {total.toLocaleString()}
            </span>
          </p>
        </SheetHeader>

        {/* Add entry */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2">
          <div className="flex gap-2">
            {/* Day */}
            <div className="w-16">
              <NumericInput
                value={day}
                onChange={(v) => setDay(v as number | undefined)}
                allowNegative={false}
                allowDecimal={false}
                emptyAs="undefined"
                placeholder="Day"
                className="h-9 text-sm rounded-xl"
              />
            </div>
            {/* Amount */}
            <div className="flex-1">
              <NumericInput
                value={amount}
                onChange={(v) => setAmount(v as number | undefined)}
                allowNegative={false}
                allowDecimal={true}
                emptyAs="undefined"
                placeholder="Amount (৳)"
                className="h-9 text-sm rounded-xl"
              />
            </div>
          </div>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="h-9 text-sm rounded-xl"
          />
          <Button
            size="sm"
            disabled={!day || !amount || saving}
            onClick={handleSubmit}
            className="h-9 rounded-xl gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {editingId ? "Update Entry" : "Add Entry"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8 rounded-xl text-xs text-gray-500"
            >
              Cancel edit
            </Button>
          )}
        </div>

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {Object.keys(byDay).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              No shopping entries yet.
            </p>
          ) : (
            Object.entries(byDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([d, entries]) => (
                <div key={d}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Day {d}
                  </p>
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 tabular-nums">
                          ৳ {Number(e.amount).toLocaleString()}
                        </p>
                        {e.note && (
                          <p className="text-[10px] text-gray-400 truncate">
                            {e.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(e)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 active:scale-95 transition-all"
                          aria-label="Edit shopping entry"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 active:scale-95 transition-all"
                          aria-label="Delete shopping entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
