"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  MealPhase,
  RateType,
  MonthCreatePayload,
} from "@/app/(meals)/types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const uid = () => Math.random().toString(36).slice(2, 9);

const newEmptyPhase = (): MealPhase => ({
  id: uid(),
  name: "",
  rate: 0,
  edit_start: "07:00",
  edit_end: "11:00",
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number;
  month: number;
  mode: "create" | "edit";
  initialRateType?: RateType; // pre-fill in edit mode
  initialPhases?: MealPhase[]; // pre-fill in edit mode
  previousSettings?: MonthCreatePayload | null; // "keep previous" in create mode
  isLoading?: boolean;
  onSubmit: (payload: MonthCreatePayload) => void;
}

export default function StartMonthDialog({
  open,
  onOpenChange,
  year,
  month,
  mode,
  initialRateType,
  initialPhases,
  previousSettings,
  isLoading = false,
  onSubmit,
}: Props) {
  const buildInitial = () => ({
    rateType: (mode === "edit" && initialRateType
      ? initialRateType
      : "dynamic") as RateType,
    phases:
      mode === "edit" && initialPhases?.length
        ? initialPhases.map((p) => ({ ...p, id: uid() }))
        : [],
  });

  const [rateType, setRateType] = useState<RateType>(buildInitial().rateType);
  const [phases, setPhases] = useState<MealPhase[]>(buildInitial().phases);

  // Re-initialise when the dialog opens so stale state never leaks through
  useEffect(() => {
    if (open) {
      const init = buildInitial();
      setRateType(init.rateType);
      setPhases(init.phases);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const keepPrevious = () => {
    if (!previousSettings) return;
    setRateType(previousSettings.rate_type);
    setPhases(previousSettings.phases.map((p) => ({ ...p, id: uid() })));
  };

  const addPhase = () => setPhases((prev) => [...prev, newEmptyPhase()]);

  const removePhase = (id: string) =>
    setPhases((prev) => prev.filter((p) => p.id !== id));

  const update = <K extends keyof MealPhase>(
    id: string,
    key: K,
    val: MealPhase[K],
  ) =>
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)),
    );

  const isFixed = rateType === "fixed";

  // Save is disabled until ≥1 phase; fixed mode also requires every rate to be set (≥0 is fine — free phase)
  const isValid = phases.length > 0 && phases.every((p) => p.name.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      rate_type: rateType,
      phases: phases.map(({ id: _id, ...rest }) => rest),
    });
  };

  const isCreate = mode === "create";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md w-[calc(100vw-2rem)] rounded-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        <AlertDialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <AlertDialogTitle className="text-base font-bold">
            {isCreate
              ? `Start ${MONTH_NAMES[month - 1]} ${year}`
              : `Edit Sheet — ${MONTH_NAMES[month - 1]} ${year}`}
          </AlertDialogTitle>
          {isCreate && (
            <p className="text-xs text-gray-400 mt-0.5">
              Add at least one phase to enable saving.
            </p>
          )}
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Keep previous settings (create mode only) */}
          {isCreate && previousSettings && (
            <button
              onClick={keepPrevious}
              className="w-full text-xs text-left font-medium text-brand-primary border border-brand-primary/25 bg-brand-primary/4 rounded-xl px-3.5 py-2.5 hover:bg-brand-primary/8 transition-colors"
            >
              ↩ Keep previous month&apos;s settings
              <span className="ml-1 text-gray-400 font-normal">
                ({previousSettings.rate_type}, {previousSettings.phases.length}{" "}
                phases)
              </span>
            </button>
          )}

          {/* ── Sheet-level rate type ─────────────────────────── */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Meal Rate Type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  type: "dynamic" as RateType,
                  label: "Dynamic",
                  desc: "Cost = Total Shopping ÷ Total Meals",
                },
                {
                  type: "fixed" as RateType,
                  label: "Fixed",
                  desc: "Set a ৳ rate per meal for each phase",
                },
              ].map(({ type, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setRateType(type)}
                  className={`px-3.5 py-3 rounded-xl border text-left transition-all ${
                    rateType === type
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight font-normal">
                    {desc}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              {isFixed
                ? "All phases use fixed rates. Set ৳ 0 for any phase that is free."
                : "All phases share the shopping pool. One rate is calculated and applied to every meal."}
            </p>
          </div>

          {/* ── Phase list ─────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Meal Phases
                {phases.length === 0 && (
                  <span className="ml-1.5 text-amber-500 normal-case font-normal">
                    — add at least one
                  </span>
                )}
              </p>
              <button
                onClick={addPhase}
                className="flex items-center gap-1 text-xs text-brand-primary font-medium hover:underline"
              >
                <Plus className="w-3 h-3" />
                Add phase
              </button>
            </div>

            {phases.length === 0 && (
              <button
                onClick={addPhase}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm text-gray-400 hover:border-brand-primary/40 hover:text-brand-primary transition-colors"
              >
                + Add your first phase
              </button>
            )}

            <div className="flex flex-col gap-2.5">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 flex flex-col gap-2"
                >
                  {/* Row 1: Name | Rate input (fixed only) | Delete */}
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={phase.name}
                      onChange={(e) => update(phase.id, "name", e.target.value)}
                      placeholder="Phase name (e.g. Lunch)"
                      className="h-8 text-sm flex-1 rounded-lg"
                    />

                    {/* Rate input — only visible in fixed mode */}
                    {isFixed && (
                      <div className="relative w-20 shrink-0">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">
                          ৳
                        </span>
                        <Input
                          type="number"
                          min={0}
                          value={phase.rate === 0 ? "" : phase.rate}
                          onChange={(e) =>
                            update(
                              phase.id,
                              "rate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          onKeyDown={(e) =>
                            ["e", "E", "+", "-"].includes(e.key) &&
                            e.preventDefault()
                          }
                          placeholder="0"
                          className="h-8 text-xs pl-5 rounded-lg"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => removePhase(phase.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 shrink-0 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row 2: Edit window */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400 w-12 shrink-0">
                      Window
                    </span>
                    <input
                      type="time"
                      value={phase.edit_start}
                      onChange={(e) =>
                        update(phase.id, "edit_start", e.target.value)
                      }
                      className="h-7 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-28"
                    />
                    <span className="text-gray-300">—</span>
                    <input
                      type="time"
                      value={phase.edit_end}
                      onChange={(e) =>
                        update(phase.id, "edit_end", e.target.value)
                      }
                      className="h-7 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-28"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="px-5 pb-5 pt-3 border-t border-gray-100 flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="flex-1 h-10 rounded-xl gap-2"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isCreate ? "Start Month" : "Save Changes"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
