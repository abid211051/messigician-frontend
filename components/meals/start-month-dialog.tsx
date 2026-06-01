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
  rate_type: "dynamic",
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
  // Create: starts empty; edit: pre-populated with current phases
  initialPhases?: MealPhase[];
  previousSettings?: MonthCreatePayload | null;
  isLoading?: boolean;
  onSubmit: (payload: MonthCreatePayload) => void;
}

export default function StartMonthDialog({
  open,
  onOpenChange,
  year,
  month,
  mode,
  initialPhases,
  previousSettings,
  isLoading = false,
  onSubmit,
}: Props) {
  const buildInitial = (): MealPhase[] => {
    if (mode === "edit" && initialPhases?.length) {
      return initialPhases.map((p) => ({ ...p, id: uid() }));
    }
    return []; // create mode always starts empty
  };

  const [phases, setPhases] = useState<MealPhase[]>(buildInitial);

  // Re-initialise whenever the dialog opens
  useEffect(() => {
    if (open) setPhases(buildInitial());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const keepPrevious = () => {
    if (!previousSettings) return;
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

  const isValid =
    phases.length > 0 &&
    phases.every((p) => p.name.trim()) &&
    phases.every((p) => p.rate_type === "dynamic" || p.rate > 0);

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      phases: phases.map(({ id: _id, ...rest }) => rest),
    });
  };

  const isCreate = mode === "create";
  const title = isCreate
    ? `Start ${MONTH_NAMES[month - 1]} ${year}`
    : `Edit Sheet — ${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md w-[calc(100vw-2rem)] rounded-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        <AlertDialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <AlertDialogTitle className="text-base font-bold">
            {title}
          </AlertDialogTitle>
          {isCreate && (
            <p className="text-xs text-gray-400 mt-0.5">
              Add at least one phase to enable saving.
            </p>
          )}
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Keep previous (create mode only) */}
          {isCreate && previousSettings && (
            <button
              onClick={keepPrevious}
              className="w-full text-xs text-left font-medium text-brand-primary border border-brand-primary/25 bg-brand-primary/4 rounded-xl px-3.5 py-2.5 hover:bg-brand-primary/8 transition-colors"
            >
              ↩ Keep previous month's settings
              <span className="ml-1 text-gray-400 font-normal">
                ({previousSettings.phases.length} phases)
              </span>
            </button>
          )}

          {/* Phase list */}
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
                  {/* Row 1: Name | Rate type | Rate input | Delete */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Input
                      value={phase.name}
                      onChange={(e) => update(phase.id, "name", e.target.value)}
                      placeholder="Name (e.g. Lunch)"
                      className="h-8 text-sm flex-1 min-w-[100px] rounded-lg"
                    />

                    {/* Rate type toggle */}
                    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden shrink-0 h-8">
                      {(["dynamic", "fixed"] as RateType[]).map((type, i) => (
                        <button
                          key={type}
                          onClick={() => update(phase.id, "rate_type", type)}
                          className={`px-2 py-1 text-[10px] font-semibold h-full transition-colors ${
                            i > 0 ? "border-l border-gray-200" : ""
                          } ${
                            phase.rate_type === type
                              ? "bg-brand-primary text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {type === "dynamic" ? "Dynamic" : "Fixed"}
                        </button>
                      ))}
                    </div>

                    {/* Rate input — only when fixed */}
                    {phase.rate_type === "fixed" && (
                      <div className="relative w-16 shrink-0">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">
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
