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
  year: number;
  month: number;
  shopping: ShoppingEntry[];
  onRefresh: () => void;
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function defaultDay(year: number, month: number): number {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month
    ? now.getDate()
    : 1;
}

export default function ShoppingPanel({
  open,
  onOpenChange,
  monthId,
  year,
  month,
  shopping,
  onRefresh,
}: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "short",
  });

  const [day, setDay] = useState(() => defaultDay(year, month));
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setDay(defaultDay(year, month));
    setAmount(undefined);
    setNote("");
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open, year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) setDay(Math.min(daysInMonth, Math.max(1, v)));
  };

  const handleSubmit = async () => {
    if (!day || !amount) return;
    setSaving(true);
    try {
      const entry_date = toISODate(year, month, day);
      if (editingId) {
        await updateShoppingEntry({
          id: editingId,
          meal_month_id: monthId,
          entry_date,
          amount,
          note: note || undefined,
        });
      } else {
        await addShoppingEntry({
          meal_month_id: monthId,
          entry_date,
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
    // Extract day number from entry_date string (YYYY-MM-DD)
    setDay(parseInt(entry.entry_date.split("-")[2], 10));
    setAmount(Number(entry.amount));
    setNote(entry.note ?? "");
  };

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
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <SheetTitle className="text-sm font-bold text-gray-900">
            Food Shopping
          </SheetTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Total:{" "}
            <span className="font-semibold text-gray-700">
              ৳ {total.toLocaleString()}
            </span>
          </p>
        </SheetHeader>

        {/* Add / Edit form */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 shrink-0">
          {/* Day selector — inline, no native date picker */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Date
            </p>
            <div className="flex items-center h-10 rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
                <span className="text-xs text-gray-400 shrink-0">Day</span>
                <input
                  type="number"
                  min={1}
                  max={daysInMonth}
                  value={day}
                  onChange={handleDayChange}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-", "."].includes(e.key) &&
                    e.preventDefault()
                  }
                  className="w-10 text-sm font-semibold text-center outline-none bg-transparent tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="h-full px-3 bg-gray-50 border-l border-gray-200 flex items-center shrink-0">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {monthLabel} {year}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Amount
            </p>
            <NumericInput
              value={amount}
              onChange={(v) => setAmount(v as number | undefined)}
              allowNegative={false}
              allowDecimal={true}
              emptyAs="undefined"
              placeholder="৳ Amount"
              className="h-10 text-sm rounded-xl"
            />
          </div>

          {/* Note */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Note
            </p>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="h-10 text-sm rounded-xl"
            />
          </div>

          <Button
            size="sm"
            disabled={!day || !amount || saving}
            onClick={handleSubmit}
            className="h-10 rounded-xl gap-1.5"
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
              className="h-9 rounded-xl text-xs text-gray-500"
            >
              Cancel edit
            </Button>
          )}
        </div>

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {Object.keys(byDay).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              No shopping entries yet.
            </p>
          ) : (
            Object.entries(byDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([d, entries]) => (
                <div key={d}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Day {d} · {monthLabel}
                  </p>
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0"
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
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-all"
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
