"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  initialRateType?: RateType;
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
        ? initialPhases.map((p) => ({ ...p }))
        : [],
  });

  const [rateType, setRateType] = useState<RateType>(buildInitial().rateType);
  const [phases, setPhases] = useState<MealPhase[]>(buildInitial().phases);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);
  const [pendingDeletePhaseId, setPendingDeletePhaseId] = useState<
    string | null
  >(null);
  const [transferTargetId, setTransferTargetId] = useState<string>("");
  const [phaseTransferMap, setPhaseTransferMap] = useState<
    Record<string, string | null>
  >({});

  const keepPrevious = () => {
    if (!previousSettings) return;
    setRateType(previousSettings.rate_type);
    setPhases(previousSettings.phases.map((p) => ({ ...p })));
  };

  const addPhase = () => setPhases((prev) => [...prev, newEmptyPhase()]);

  const removePhase = (id: string) => {
    if (phases.length <= 1) return;
    if (mode === "create") {
      setPhases((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setPendingDeletePhaseId(id);
    setTransferTargetId(phases.find((p) => p.id !== id)?.id ?? "");
    setDeletePromptOpen(true);
  };

  const applyPhaseDelete = (transfer: boolean) => {
    if (!pendingDeletePhaseId) return;
    setPhaseTransferMap((prev) => ({
      ...prev,
      [pendingDeletePhaseId]: transfer ? transferTargetId || null : null,
    }));
    setPhases((prev) => prev.filter((p) => p.id !== pendingDeletePhaseId));
    setDeletePromptOpen(false);
    setPendingDeletePhaseId(null);
    setTransferTargetId("");
  };

  const cancelPhaseDelete = () => {
    setDeletePromptOpen(false);
    setPendingDeletePhaseId(null);
    setTransferTargetId("");
  };

  const update = <K extends keyof MealPhase>(
    id: string,
    key: K,
    val: MealPhase[K],
  ) =>
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)),
    );

  const isFixed = rateType === "fixed";
  const isCreate = mode === "create";
  const isValid = phases.length > 0 && phases.every((p) => p.name.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      rate_type: rateType,
      phases: phases.map((p) => ({ ...p })),
      phase_transfer_map: phaseTransferMap,
    });
  };

  // Uniform padding: p-5 on all sections for consistent visual weight
  const SECTION_P = "px-5";

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="sm:max-w-md w-[min(calc(100vw-1.5rem),448px)] rounded-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* Header */}
          <AlertDialogHeader
            className={`${SECTION_P} pt-5 pb-4 border-b border-gray-100 bg-white shrink-0`}
          >
            <AlertDialogTitle className="text-base font-bold">
              {isCreate
                ? `Start ${MONTH_NAMES[month - 1]} ${year}`
                : `Edit Sheet — ${MONTH_NAMES[month - 1]} ${year}`}
            </AlertDialogTitle>
            {isCreate && (
              <p className="text-xs text-gray-400 mt-1">
                Add at least one phase to enable saving.
              </p>
            )}
          </AlertDialogHeader>

          {/* Scrollable body — same px-5 as header/footer */}
          <div
            className={`flex-1 overflow-y-auto bg-white ${SECTION_P} py-5 flex flex-col gap-5`}
          >
            {isCreate && previousSettings && (
              <button
                onClick={keepPrevious}
                className="w-full text-xs text-left font-medium text-brand-primary border border-brand-primary/25 bg-brand-primary/4 rounded-xl px-4 py-3 hover:bg-brand-primary/8 transition-colors"
              >
                ↩ Keep previous month&apos;s settings
                <span className="ml-1 text-gray-400 font-normal">
                  ({previousSettings.rate_type},{" "}
                  {previousSettings.phases.length} phases)
                </span>
              </button>
            )}

            {/* Rate type */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                Meal Rate Type
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    type: "dynamic" as RateType,
                    label: "Dynamic",
                    desc: "Cost = Shopping ÷ Meals",
                  },
                  {
                    type: "fixed" as RateType,
                    label: "Fixed",
                    desc: "৳ rate per meal per phase",
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
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                {isFixed
                  ? "All phases use fixed rates. Set ৳ 0 for any free phase."
                  : "All phases share the shopping pool. One rate applies to every meal."}
              </p>
            </div>

            {/* Phases */}
            <div>
              <div className="flex items-center justify-between mb-3">
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
                  <Plus className="w-3 h-3" /> Add phase
                </button>
              </div>

              {phases.length === 0 && (
                <button
                  onClick={addPhase}
                  className="w-full rounded-xl border-2 border-dashed border-gray-200 py-7 text-sm text-gray-400 hover:border-brand-primary/40 hover:text-brand-primary transition-colors"
                >
                  + Add your first phase
                </button>
              )}

              <div className="flex flex-col gap-3">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex flex-col gap-3"
                  >
                    {/* Name + delete */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={phase.name}
                        onChange={(e) =>
                          update(phase.id, "name", e.target.value)
                        }
                        placeholder="Phase name (e.g. Lunch)"
                        className="h-10 text-sm flex-1 min-w-0 rounded-lg bg-white"
                      />
                      <button
                        onClick={() => removePhase(phase.id)}
                        disabled={phases.length <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0 transition-colors disabled:opacity-30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rate (fixed only) */}
                    {isFixed && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                          Rate per meal
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
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
                            className="h-10 text-sm pl-7 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Edit window — label above, inputs below */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Member edit window
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={phase.edit_start}
                          onChange={(e) =>
                            update(phase.id, "edit_start", e.target.value)
                          }
                          className="h-10 text-sm border border-gray-200 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 flex-1 min-w-0 transition-all"
                        />
                        <span className="text-gray-400 text-xs font-medium shrink-0">
                          to
                        </span>
                        <input
                          type="time"
                          value={phase.edit_end}
                          onChange={(e) =>
                            update(phase.id, "edit_end", e.target.value)
                          }
                          className="h-10 text-sm border border-gray-200 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 flex-1 min-w-0 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer — same px-5 as header/body, solid white */}
          <AlertDialogFooter
            className={`${SECTION_P} pb-5 pt-4 border-t border-gray-100 bg-white rounded-b-2xl flex flex-row gap-2.5 shrink-0`}
          >
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="flex-1 h-11 rounded-xl text-sm gap-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isCreate ? "Start Month" : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phase delete dialog — X is the only cancel, no redundant button */}
      <AlertDialog open={deletePromptOpen} onOpenChange={cancelPhaseDelete}>
        <AlertDialogContent className="sm:max-w-sm w-[min(calc(100vw-1.5rem),400px)] rounded-2xl p-0 gap-0 overflow-hidden">
          <AlertDialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between gap-3">
              <AlertDialogTitle className="text-base font-bold">
                Delete phase?
              </AlertDialogTitle>
              <button
                onClick={cancelPhaseDelete}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </AlertDialogHeader>

          <div className="px-5 py-5 bg-white flex flex-col gap-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Transfer this phase&apos;s meal entries to another phase, or
              delete them permanently.
            </p>
            <Select
              value={transferTargetId}
              onValueChange={setTransferTargetId}
            >
              <SelectTrigger className="h-11 rounded-xl text-sm bg-gray-50">
                <SelectValue placeholder="Select transfer target" />
              </SelectTrigger>
              <SelectContent>
                {phases
                  .filter((p) => p.id !== pendingDeletePhaseId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">
                      {p.name || "Unnamed phase"}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter className="px-5 pb-5 pt-4 border-t border-gray-100 bg-white rounded-b-2xl flex flex-row gap-2.5">
            <Button
              variant="outline"
              onClick={() => applyPhaseDelete(true)}
              disabled={!transferTargetId}
              className="flex-1 h-11 rounded-xl text-sm"
            >
              Transfer & Delete
            </Button>
            <Button
              variant="destructive"
              onClick={() => applyPhaseDelete(false)}
              className="flex-1 h-11 rounded-xl text-sm"
            >
              Delete Only
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
