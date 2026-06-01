"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
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
import { addDepositEntry, deleteDepositEntry } from "@/app/(meals)/actions";
import type { DepositEntry, MealMember } from "@/app/(meals)/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  monthId: string;
  members: MealMember[];
  deposits: DepositEntry[];
  onRefresh: () => void;
}

export default function DepositPanel({
  open,
  onOpenChange,
  monthId,
  members,
  deposits,
  onRefresh,
}: Props) {
  const [memberId, setMemberId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const parsedAmount = parseFloat(amount);
    if (!memberId || !parsedAmount || parsedAmount <= 0) return;
    setSaving(true);
    try {
      await addDepositEntry({
        meal_month_id: monthId,
        member_id: memberId,
        amount: parsedAmount,
        note: note.trim() || undefined,
      });
      setAmount("");
      setNote("");
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

  // Group deposits by member for display
  const byMember = members.reduce<Record<string, DepositEntry[]>>((acc, m) => {
    acc[m?.id] = deposits?.filter((d) => d?.member_id === m?.id);
    return acc;
  }, {});

  const totalDeposit = deposits?.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-4 pt-5 pb-3 border-b border-gray-100">
          <SheetTitle className="text-sm font-bold text-gray-900">
            Member Deposits
          </SheetTitle>
          <p className="text-xs text-gray-400">
            Total deposited:{" "}
            <span className="font-semibold text-gray-700">
              ৳ {totalDeposit?.toLocaleString()}
            </span>
          </p>
        </SheetHeader>

        {/* Add form */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2">
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger className="h-9 rounded-xl text-sm">
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members?.map((m) => (
                <SelectItem key={m?.id} value={m?.id} className="text-sm">
                  {m?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min={0}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
            placeholder="Amount (৳)"
            className="h-9 text-sm rounded-xl"
          />

          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="h-9 text-sm rounded-xl"
          />

          <Button
            size="sm"
            disabled={!memberId || !amount || parseFloat(amount) <= 0 || saving}
            onClick={handleAdd}
            className="h-9 rounded-xl gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deposit
          </Button>
        </div>

        {/* Deposits list — grouped by member */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          {members.map((m) => {
            const memberDeposits = byMember[m.id] ?? [];
            const memberTotal = memberDeposits.reduce(
              (s, d) => s + Number(d.amount),
              0,
            );
            if (memberDeposits.length === 0) return null;
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    {m.name}
                  </p>
                  <span className="text-[10px] font-semibold text-gray-600 tabular-nums">
                    ৳ {memberTotal?.toLocaleString()}
                  </span>
                </div>
                {memberDeposits.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0"
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
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 active:scale-95 transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}

          {deposits?.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              No deposits recorded yet.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
