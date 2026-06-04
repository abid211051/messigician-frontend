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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleApiError } from "@/lib/helpers/errors";
import {
  addDepositEntry,
  deleteDepositEntry,
  updateDepositEntry,
} from "@/app/(meals)/actions";
import type { DepositEntry, MealMember } from "@/app/(meals)/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  monthId: string;
  year: number;
  month: number;
  members: MealMember[];
  deposits: DepositEntry[];
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

export default function DepositPanel({
  open,
  onOpenChange,
  monthId,
  year,
  month,
  members,
  deposits,
  onRefresh,
}: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "short",
  });

  const [memberId, setMemberId] = useState<string>("");
  const [day, setDay] = useState(() => defaultDay(year, month));
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setMemberId("");
    setDay(defaultDay(year, month));
    setAmount("");
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
    const parsedAmount = parseFloat(amount);
    if (!memberId || !parsedAmount || parsedAmount <= 0) return;
    setSaving(true);
    try {
      const entry_date = toISODate(year, month, day);
      if (editingId) {
        await updateDepositEntry({
          id: editingId,
          meal_month_id: monthId,
          member_id: memberId,
          entry_date,
          amount: parsedAmount,
          note: note.trim() || undefined,
        });
      } else {
        await addDepositEntry({
          meal_month_id: monthId,
          member_id: memberId,
          entry_date,
          amount: parsedAmount,
          note: note.trim() || undefined,
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
      await deleteDepositEntry(id);
      onRefresh();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (entry: DepositEntry) => {
    setEditingId(entry.id);
    setMemberId(entry.member_id);
    setDay(parseInt(entry.entry_date.split("-")[2], 10));
    setAmount(entry.amount);
    setNote(entry.note ?? "");
  };

  const byMember = members.reduce<Record<string, DepositEntry[]>>((acc, m) => {
    acc[m.id] = deposits.filter((d) => d.member_id === m.id);
    return acc;
  }, {});

  const totalDeposit = deposits.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <SheetTitle className="text-sm font-bold text-gray-900">
            Member Deposits
          </SheetTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Total:{" "}
            <span className="font-semibold text-gray-700">
              ৳ {totalDeposit.toLocaleString()}
            </span>
          </p>
        </SheetHeader>

        {/* Add / Edit form */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 shrink-0">
          {/* Member */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Member
            </p>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger className="h-10 rounded-xl text-sm">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-sm">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day selector */}
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
            <Input
              type="number"
              min={0}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) =>
                ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
              }
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
            disabled={!memberId || !amount || parseFloat(amount) <= 0 || saving}
            onClick={handleSubmit}
            className="h-10 rounded-xl gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {editingId ? "Update Deposit" : "Add Deposit"}
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

        {/* Deposits list — grouped by member */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {deposits.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">
              No deposits recorded yet.
            </p>
          )}
          {members.map((m) => {
            const memberDeposits = byMember[m.id] ?? [];
            if (memberDeposits.length === 0) return null;
            const memberTotal = memberDeposits.reduce(
              (s, d) => s + Number(d.amount),
              0,
            );
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    {m.name}
                  </p>
                  <span className="text-xs font-semibold text-gray-600 tabular-nums">
                    ৳ {memberTotal.toLocaleString()}
                  </span>
                </div>
                {memberDeposits.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 tabular-nums">
                        ৳ {Number(d.amount).toLocaleString()}
                      </p>
                      {d.note && (
                        <p className="text-[10px] text-gray-400 truncate">
                          {d.note}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-300">
                        Day {parseInt(d.entry_date.split("-")[2], 10)} ·{" "}
                        {monthLabel} {year}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(d)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
