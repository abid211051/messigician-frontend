"use client";

import { useState, useEffect } from "react";
import { handleApiError } from "@/lib/helpers/errors";
import { upsertMealEntry } from "@/app/(meals)/actions";

interface Props {
  monthId: string;
  memberId: string;
  dayNumber: number;
  phaseId: string; // "total" for dynamic, phase.id for fixed
  value: number;
  canEdit: boolean;
  isClosed: boolean;
  onSuccess: (count: number) => void;
}

export default function MealCell({
  monthId,
  memberId,
  dayNumber,
  phaseId,
  value,
  canEdit,
  isClosed,
  onSuccess,
}: Props) {
  const [local, setLocal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocal(value);
    setDirty(false);
  }, [value]);

  const save = async (count: number) => {
    setSaving(true);
    try {
      await upsertMealEntry({
        meal_month_id: monthId,
        member_id: memberId,
        day_number: dayNumber,
        phase_id: phaseId,
        count,
      });
      onSuccess(count);
    } catch (err) {
      handleApiError(err);
      setLocal(value);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setLocal(0);
      setDirty(true);
      return;
    }
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    const clamped = Math.min(5000, Math.max(0, parsed));
    setLocal(clamped);
    setDirty(true);
  };

  if (isClosed || !canEdit) {
    return (
      <div className="flex items-center justify-center px-1 py-1.5 min-w-12 h-8">
        <span
          className={`text-xs tabular-nums ${value === 0 ? "text-gray-300" : "text-gray-700 font-medium"}`}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center px-1 py-1 min-w-12 h-8 ${saving ? "opacity-40" : ""}`}
    >
      <input
        type="number"
        min={0}
        max={5000}
        step={1}
        value={local === 0 ? "" : local}
        placeholder="0"
        onChange={handleChange}
        onKeyDown={(e) =>
          ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
        }
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          if (dirty && local !== value) save(local);
          else setDirty(false);
        }}
        className="
          w-10 h-6 text-center text-xs font-medium tabular-nums rounded
          border border-gray-200 bg-gray-50
          focus:outline-none focus:ring-1 focus:ring-blue-400
          focus:border-blue-400 focus:bg-white transition-all
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
      />
    </div>
  );
}
