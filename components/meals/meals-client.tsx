"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Wallet,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/helpers/errors";
import PageSkeleton from "@/components/reusable/loading-skeleton";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import { Button } from "@/components/ui/button";
import MealSheet from "./meals-sheet";
import SummaryBar from "./summary-bar";
import ShoppingPanel from "./shopping-panel";
import DepositPanel from "./deposit-panel";
import StartMonthDialog from "./start-month-dialog";
import {
  fetchSheet,
  createMonth,
  updateMonthPhases,
  deleteMonth,
  getPreviousSettings,
} from "@/app/(meals)/actions";
import type {
  SheetData,
  MemberSummary,
  MealPhase,
  MonthCreatePayload,
} from "@/app/(meals)/types";

// Recalculate summary client-side after optimistic updates
function recalculate(
  data: SheetData,
): Pick<SheetData, "summary" | "member_summary"> {
  const { phases } = data.month;
  const totalShopping = data.shopping.reduce((s, e) => s + Number(e.amount), 0);
  const totalMeals = data.entries.reduce(
    (s, e) => s + Object.values(e.counts).reduce((a, b) => a + b, 0),
    0,
  );
  const perMealCost =
    totalMeals > 0 ? +(totalShopping / totalMeals).toFixed(4) : 0;

  const memberSummary: MemberSummary[] = data.members.map((member) => {
    let meals = 0,
      mealCost = 0;
    for (const e of data.entries.filter((e) => e.member_id === member.id)) {
      for (const [phaseId, count] of Object.entries(e.counts)) {
        meals += count;
        const phase = phases.find((p) => p.id === phaseId);
        mealCost +=
          phase?.rate_type === "fixed"
            ? count * phase.rate
            : count * perMealCost;
      }
    }
    const totalDeposit = data.deposits
      .filter((d) => d.member_id === member.id)
      .reduce((s, d) => s + Number(d.amount), 0);
    return {
      ...member,
      total_meals: meals,
      meal_cost: +mealCost.toFixed(2),
      total_deposit: totalDeposit,
      balance: +(mealCost - totalDeposit).toFixed(2),
    };
  });

  return {
    summary: {
      total_meals: totalMeals,
      total_shopping: totalShopping,
      per_meal_cost: perMealCost,
    },
    member_summary: memberSummary,
  };
}

interface Props {
  subMessId: string;
  isOwner: boolean;
}

export default function MealsClient({ subMessId, isOwner }: Props) {
  const userId = useAuthStore((s) => s.user?.id);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const offset =
    (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
  const canGoPrev = offset > -3;
  const canGoNext = offset < 3;
  const canCreate = offset >= 0 && offset <= 3;

  const prevMonth = () => {
    if (!canGoPrev) return;
    month === 1
      ? (setYear((y) => y - 1), setMonth(12))
      : setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (!canGoNext) return;
    month === 12
      ? (setYear((y) => y + 1), setMonth(1))
      : setMonth((m) => m + 1);
  };

  const [data, setData] = useState<SheetData | null>(null);
  const [isPending, startLoading] = useTransition();
  const [initialised, setInit] = useState(false);

  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  // Sheet dialog — shared between create and edit modes
  const [sheetDialogOpen, setSheetDialogOpen] = useState(false);
  const [sheetDialogMode, setSheetDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [sheetDialogPhases, setSheetDialogPhases] = useState<
    MealPhase[] | undefined
  >();
  const [prevSettings, setPrevSettings] = useState<MonthCreatePayload | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ── Open create dialog ─────────────────────────────────────────────────
  const handleOpenCreate = async () => {
    const prev = await getPreviousSettings();
    setPrevSettings(prev);
    setSheetDialogMode("create");
    setSheetDialogPhases(undefined);
    setSheetDialogOpen(true);
  };

  // ── Open edit dialog ───────────────────────────────────────────────────
  const handleOpenEdit = () => {
    if (!data) return;
    setSheetDialogMode("edit");
    setSheetDialogPhases(data.month.phases);
    setSheetDialogOpen(true);
  };

  // ── Dialog submit (create or edit) ─────────────────────────────────────
  const handleSheetSubmit = async (payload: MonthCreatePayload) => {
    setIsSubmitting(true);
    try {
      const updated =
        sheetDialogMode === "create"
          ? await createMonth(subMessId, year, month, payload)
          : await updateMonthPhases(data!.month.id, payload);
      setData(updated);
      setSheetDialogOpen(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete sheet ───────────────────────────────────────────────────────
  const handleDeleteSheet = async () => {
    if (!data) return;
    setIsDeleting(true);
    try {
      await deleteMonth(data.month.id);
      setData(null);
      setDeleteOpen(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Optimistic cell update ─────────────────────────────────────────────
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
      const next = { ...prev, entries };
      return { ...next, ...recalculate(next) };
    });
  };

  const monthLabel = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (!initialised || isPending) return <PageSkeleton count={8} />;

  return (
    <div className="pb-24 max-w-screen-xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 active:scale-95 transition-all disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-32 text-center">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 active:scale-95 transition-all disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="flex items-center gap-1.5">
            {data && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenEdit}
                  className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-gray-200"
                >
                  <Pencil className="w-3 h-3" />
                  <span className="hidden sm:inline">Edit Sheet</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
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

      {/* ── Content ─────────────────────────────────────────────── */}
      {!data ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 text-center">
          <p className="text-sm text-gray-500 mb-3">
            No meal sheet for {monthLabel} yet.
          </p>
          {isOwner && canCreate && (
            <Button size="sm" onClick={handleOpenCreate} className="rounded-xl">
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
            phases={data.month.phases}
            summary={data.summary}
            memberSummary={data.member_summary}
            currentUserId={userId!}
          />
        </>
      )}

      {/* ── Sheet create/edit dialog ─────────────────────────────── */}
      <StartMonthDialog
        open={sheetDialogOpen}
        onOpenChange={setSheetDialogOpen}
        year={year}
        month={month}
        mode={sheetDialogMode}
        initialPhases={sheetDialogPhases}
        previousSettings={
          sheetDialogMode === "create" ? prevSettings : undefined
        }
        isLoading={isSubmitting}
        onSubmit={handleSheetSubmit}
      />

      {/* ── Delete confirm ───────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this month's sheet?"
        description="All meal entries, shopping, and deposit data for this month will be permanently deleted."
        confirmLabel="Delete Sheet"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteSheet}
      />

      {/* ── Panels ───────────────────────────────────────────────── */}
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
