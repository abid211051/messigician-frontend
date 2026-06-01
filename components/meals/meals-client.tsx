"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Wallet } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/helpers/errors";
import PageSkeleton from "@/components/reusable/loading-skeleton";
import { Button } from "@/components/ui/button";
import MealSheet from "./meals-sheet";
import SummaryBar from "./summary-bar";
import ShoppingPanel from "./shopping-panel";
import DepositPanel from "./deposit-panel";
import StartMonthDialog from "./start-month-dialog";
import {
  fetchSheet,
  createMonth,
  getPreviousSettings,
} from "@/app/(meals)/actions";
import type { SheetData, MonthCreatePayload } from "@/app/(meals)/types";

interface Props {
  subMessId: string;
  isOwner: boolean;
}

export default function MealsClient({ subMessId, isOwner }: Props) {
  const userId = useAuthStore((s) => s.user?.id);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  const [data, setData] = useState<SheetData | null>(null);
  const [isPending, startLoading] = useTransition();
  const [initialised, setInit] = useState(false);

  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [prevSettings, setPrevSettings] = useState<MonthCreatePayload | null>(
    null,
  );

  const load = useCallback(() => {
    startLoading(async () => {
      try {
        setData(await fetchSheet(subMessId, year, month));
      } catch {
        setData(null);
      } finally {
        setInit(true);
      }
    });
  }, [subMessId, year, month]);

  useEffect(() => {
    setInit(false);
    load();
  }, [load]);

  // Load previous settings when the dialog opens
  const handleOpenStartDialog = async () => {
    const prev = await getPreviousSettings();
    setPrevSettings(prev);
    setStartOpen(true);
  };

  const handleCreateMonth = async (payload: MonthCreatePayload) => {
    setIsCreating(true);
    try {
      const newData = await createMonth(subMessId, year, month, payload);
      setData(newData);
      setStartOpen(false);
    } catch (err) {
      console.log(err);

      handleApiError(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Optimistic update — patches just the one changed cell
  const handleCellChange = (
    memberId: string,
    dayNumber: number,
    phaseId: string,
    count: number,
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      const idx = prev.entries.findIndex(
        (e) => e.member_id === memberId && e.day_number === dayNumber,
      );
      const entries =
        idx === -1
          ? [
              ...prev.entries,
              {
                member_id: memberId,
                day_number: dayNumber,
                counts: { [phaseId]: count },
              },
            ]
          : prev.entries.map((e, i) =>
              i === idx
                ? { ...e, counts: { ...e.counts, [phaseId]: count } }
                : e,
            );
      return { ...prev, entries };
    });
  };

  const monthLabel = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (!initialised || isPending) return <PageSkeleton count={8} />;

  return (
    <div className="pb-24 px-3 pt-3 max-w-[1400px] mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-[120px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 active:scale-95 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isOwner && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDepositOpen(true)}
              className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-gray-200"
            >
              <Wallet className="w-3 h-3" />
              <span className="hidden sm:inline">Deposits</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShoppingOpen(true)}
              className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-gray-200"
            >
              <ShoppingCart className="w-3 h-3" />
              <span className="hidden sm:inline">Shopping</span>
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {!data ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 text-center">
          <p className="text-sm text-gray-500 mb-3">
            No meal sheet for {monthLabel} yet.
          </p>
          {isOwner && (
            <Button
              size="sm"
              onClick={handleOpenStartDialog}
              className="rounded-xl"
            >
              Start this month
            </Button>
          )}
        </div>
      ) : (
        <>
          <MealSheet
            data={data}
            isOwner={isOwner}
            currentUserId={userId!}
            onCellChange={handleCellChange}
          />
          <SummaryBar
            rateType={data.month.rate_type}
            summary={data.summary}
            memberSummary={data.member_summary}
            currentUserId={userId!}
          />
        </>
      )}

      {/* Dialogs / Panels */}
      <StartMonthDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        year={year}
        month={month}
        previousSettings={prevSettings}
        isLoading={isCreating}
        onSubmit={handleCreateMonth}
      />

      {isOwner && data && (
        <>
          <ShoppingPanel
            open={shoppingOpen}
            onOpenChange={setShoppingOpen}
            monthId={data.month.id}
            shopping={data.shopping}
            onRefresh={load}
          />
          <DepositPanel
            open={depositOpen}
            onOpenChange={setDepositOpen}
            monthId={data.month.id}
            members={data.members}
            deposits={data.deposits}
            onRefresh={load}
          />
        </>
      )}
    </div>
  );
}
