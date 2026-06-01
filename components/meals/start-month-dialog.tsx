"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  RateType,
  MealPhase,
  MonthCreatePayload,
} from "@/app/(meals)/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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

// Stable temp IDs for managing the list before submission
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_PHASES: Record<RateType, MealPhase[]> = {
  dynamic: [
    {
      id: uid(),
      name: "Lunch",
      rate: 0,
      edit_start: "07:00",
      edit_end: "11:00",
    },
    {
      id: uid(),
      name: "Dinner",
      rate: 0,
      edit_start: "18:00",
      edit_end: "22:00",
    },
  ],
  fixed: [
    {
      id: uid(),
      name: "Lunch",
      rate: 55,
      edit_start: "07:00",
      edit_end: "11:00",
    },
    {
      id: uid(),
      name: "Dinner",
      rate: 85,
      edit_start: "18:00",
      edit_end: "22:00",
    },
  ],
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number;
  month: number;
  previousSettings?: MonthCreatePayload | null;
  isLoading?: boolean;
  onSubmit: (payload: MonthCreatePayload) => void;
}

export default function StartMonthDialog({
  open,
  onOpenChange,
  year,
  month,
  previousSettings,
  isLoading = false,
  onSubmit,
}: Props) {
  const [rateType, setRateType] = useState<RateType>("dynamic");
  const [phases, setPhases] = useState<MealPhase[]>(() =>
    DEFAULT_PHASES.dynamic.map((p) => ({ ...p, id: uid() })),
  );

  // Switch rate type and reset phases to sensible defaults
  const switchRateType = (type: RateType) => {
    setRateType(type);
    setPhases(DEFAULT_PHASES[type].map((p) => ({ ...p, id: uid() })));
  };

  // Restore previous month's settings
  const keepPrevious = () => {
    if (!previousSettings) return;
    setRateType(previousSettings.rate_type);
    setPhases(previousSettings.phases.map((p) => ({ ...p, id: uid() })));
  };

  const addPhase = () =>
    setPhases((prev) => [
      ...prev,
      { id: uid(), name: "", rate: 0, edit_start: "07:00", edit_end: "11:00" },
    ]);

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

  const isValid =
    phases.length > 0 &&
    phases.every((p) => p.name.trim()) &&
    (rateType === "dynamic" || phases.every((p) => p.rate > 0));

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      rate_type: rateType,
      phases: phases.map(({ id: _id, ...rest }) => rest),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md w-[calc(100vw-2rem)] rounded-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        <AlertDialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <AlertDialogTitle className="text-base font-bold">
            Start {MONTH_NAMES[month - 1]} {year}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Keep previous settings */}
          {previousSettings && (
            <button
              onClick={keepPrevious}
              className="w-full text-xs text-left font-medium text-brand-primary border border-brand-primary/25 bg-brand-primary/4 rounded-xl px-3.5 py-2.5 hover:bg-brand-primary/8 transition-colors"
            >
              ↩ Keep previous month's settings
              <span className="ml-1 text-gray-400 font-normal">
                ({previousSettings.rate_type}, {previousSettings.phases.length}{" "}
                phases)
              </span>
            </button>
          )}

          {/* Rate type selection */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Meal Rate Type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["dynamic", "fixed"] as RateType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => switchRateType(type)}
                  className={`px-3.5 py-3 rounded-xl border text-left transition-all ${
                    rateType === type
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold capitalize">{type}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight font-normal">
                    {type === "dynamic"
                      ? "Cost = Shopping ÷ Total Meals"
                      : "Fixed ৳ rate per meal phase"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Phase list */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {rateType === "fixed" ? "Meal Phases & Rates" : "Edit Windows"}
              </p>
              <button
                onClick={addPhase}
                className="flex items-center gap-1 text-xs text-brand-primary font-medium hover:underline"
              >
                <Plus className="w-3 h-3" />
                Add phase
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 flex flex-col gap-2"
                >
                  {/* Name + Rate (fixed) + Delete */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={phase.name}
                      onChange={(e) => update(phase.id, "name", e.target.value)}
                      placeholder="Phase name"
                      className="h-8 text-sm flex-1 rounded-lg"
                    />

                    {rateType === "fixed" && (
                      <div className="relative w-20 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">
                          ৳
                        </span>
                        <Input
                          type="number"
                          min={0}
                          value={phase.rate || ""}
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
                          placeholder="Rate"
                          className="h-8 text-sm pl-6 rounded-lg"
                        />
                      </div>
                    )}

                    {phases.length > 1 && (
                      <button
                        onClick={() => removePhase(phase.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 shrink-0 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Edit window */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-medium text-gray-400 w-12 shrink-0">
                      Window
                    </span>
                    <input
                      type="time"
                      value={phase.edit_start}
                      onChange={(e) =>
                        update(phase.id, "edit_start", e.target.value)
                      }
                      className="h-7 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-[104px]"
                    />
                    <span className="text-gray-300 text-sm">—</span>
                    <input
                      type="time"
                      value={phase.edit_end}
                      onChange={(e) =>
                        update(phase.id, "edit_end", e.target.value)
                      }
                      className="h-7 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-[104px]"
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
            Start Month
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
