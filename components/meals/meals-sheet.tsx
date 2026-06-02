"use client";

import { useMemo } from "react";
import MealCell from "./meals-cell";
import type { SheetData } from "@/app/(meals)/types";

interface Props {
  data: SheetData;
  isOwner: boolean;
  currentUserId: string;
  onCellChange: (
    memberId: string,
    dayNumber: number,
    phaseId: string,
    count: number,
  ) => void;
}

function currentHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function MealSheet({
  data,
  isOwner,
  currentUserId,
  onCellChange,
}: Props) {
  const { month, members, entries, shopping } = data;
  const { phases, status, rate_type } = month; // rate_type is sheet-level
  const now = new Date();
  const isThisMonth =
    now.getFullYear() === month.year && now.getMonth() + 1 === month.month;
  const today = now.getDate();
  const daysInMonth = new Date(month.year, month.month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isClosed = status === "closed";

  // Per-phase edit-window open/closed — computed once per render
  const phaseWindowMap = useMemo(() => {
    const t = currentHHMM();
    return Object.fromEntries(
      phases.map((p) => [
        p.id,
        !isClosed && t >= p.edit_start && t <= p.edit_end,
      ]),
    );
  }, [phases, isClosed]);

  // "memberId-day-phaseId" → count
  const entryMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of entries)
      for (const [pId, cnt] of Object.entries(e.counts))
        m[`${e.member_id}-${e.day_number}-${pId}`] = cnt;
    return m;
  }, [entries]);

  // Total meals per member across all days (for totals row)
  const memberTotals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const e of entries)
      t[e.member_id] =
        (t[e.member_id] ?? 0) +
        Object.values(e.counts).reduce((a, b) => a + b, 0);
    return t;
  }, [entries]);

  // Total meals per member per phase (for totals row in fixed layout)
  const phaseTotals = useMemo(() => {
    const t: Record<string, number> = {}; // "memberId-phaseId"
    for (const e of entries)
      for (const [pId, cnt] of Object.entries(e.counts)) {
        const k = `${e.member_id}-${pId}`;
        t[k] = (t[k] ?? 0) + cnt;
      }
    return t;
  }, [entries]);

  const shoppingByDay = useMemo(() => {
    const m: Record<number, number> = {};
    for (const s of shopping)
      m[s.day_number] = (m[s.day_number] ?? 0) + Number(s.amount);
    return m;
  }, [shopping]);

  const STICKY = "sticky left-0 z-10";
  const HDR = "text-[10px] font-semibold text-gray-500 uppercase tracking-wide";
  const CELL_W = "min-w-[52px]";
  const TODAY_BG = "bg-blue-50/40";

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white mb-3">
      <table className="border-collapse text-xs w-full">
        <thead>
          {/* Row 1: Day | Member names (colSpan = phases.length) | Shop */}
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th
              className={`${STICKY} bg-gray-50/60 px-2 py-2.5 text-left ${HDR} border-r border-gray-100 min-w-[44px]`}
            >
              Day
            </th>
            {members.map((m) => (
              <th
                key={m.id}
                colSpan={phases.length}
                className={`px-1.5 py-2 text-center ${HDR} border-r border-gray-100 last:border-r-0`}
              >
                <span className="truncate block mx-auto" title={m.name}>
                  {m.name.split(" ")[0]}
                </span>
              </th>
            ))}
            <th className={`${CELL_W} px-1.5 py-2.5 text-center ${HDR}`}>
              Shop (৳)
            </th>
          </tr>

          {/* Row 2: Phase names + rate indicator (rate shown only in fixed mode) */}
          <tr className="border-b border-gray-100 bg-gray-50/30">
            <th
              className={`${STICKY} bg-gray-50/30 px-2 py-1 border-r border-gray-100`}
            />
            {members.flatMap((m) =>
              phases.map((p, pi) => (
                <th
                  key={`${m.id}-${p.id}`}
                  className={`${CELL_W} px-1 py-1 text-center text-[9px] font-medium text-gray-400 ${
                    pi === phases.length - 1 ? "border-r border-gray-100" : ""
                  }`}
                  title={
                    rate_type === "fixed"
                      ? `${p.name} · ৳${p.rate}/meal (fixed)`
                      : `${p.name} (dynamic)`
                  }
                >
                  {p.name.slice(0, 3)}
                  {/* Rate indicator only meaningful in fixed mode */}
                  {rate_type === "fixed" && (
                    <span className="ml-0.5 text-gray-300">·{p.rate}</span>
                  )}
                </th>
              )),
            )}
            <th />
          </tr>
        </thead>

        <tbody>
          {days.map((day) => {
            const isToday = isThisMonth && day === today;
            return (
              <tr
                key={day}
                className={`border-b border-gray-50 last:border-b-0 ${isToday ? TODAY_BG : ""}`}
              >
                {/* Day label */}
                <td
                  className={`${STICKY} px-2 py-0.5 border-r border-gray-100 font-medium whitespace-nowrap text-gray-600 ${
                    isToday ? `${TODAY_BG} text-blue-600` : "bg-white"
                  }`}
                >
                  {day}
                  {isToday && (
                    <span className="ml-1 text-[8px] text-blue-400 font-semibold align-middle">
                      today
                    </span>
                  )}
                </td>

                {/* One cell per phase per member */}
                {members.flatMap((m) =>
                  phases.map((p, pi) => {
                    const value = entryMap[`${m.id}-${day}-${p.id}`] ?? 0;
                    const canEdit =
                      isOwner ||
                      (m.id === currentUserId &&
                        isToday &&
                        phaseWindowMap[p.id]);
                    const isLastPhase = pi === phases.length - 1;

                    return (
                      <td
                        key={`${m.id}-${p.id}`}
                        className={`p-0 ${isLastPhase ? "border-r border-gray-100" : ""} ${isToday ? TODAY_BG : ""}`}
                      >
                        <MealCell
                          monthId={month.id}
                          memberId={m.id}
                          dayNumber={day}
                          phaseId={p.id}
                          value={value}
                          canEdit={canEdit}
                          isClosed={!isOwner && isClosed}
                          onSuccess={(c) => onCellChange(m.id, day, p.id, c)}
                        />
                      </td>
                    );
                  }),
                )}

                {/* Shopping total for the day */}
                <td
                  className={`px-1.5 py-1.5 text-center text-gray-600 tabular-nums ${isToday ? TODAY_BG : ""}`}
                >
                  {shoppingByDay[day] ? (
                    shoppingByDay[day].toLocaleString()
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}

          {/* Totals row */}
          <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
            <td
              className={`${STICKY} bg-gray-50 px-2 py-1.5 text-gray-700 border-r border-gray-200 text-xs`}
            >
              Total
            </td>
            {members.flatMap((m) =>
              phases.map((p, pi) => {
                const isLastPhase = pi === phases.length - 1;
                return (
                  <td
                    key={`${m.id}-${p.id}`}
                    className={`text-center px-1.5 py-1.5 text-gray-800 tabular-nums text-xs ${
                      isLastPhase ? "border-r border-gray-100" : ""
                    }`}
                  >
                    {phaseTotals[`${m.id}-${p.id}`] ?? 0}
                  </td>
                );
              }),
            )}
            <td className="text-center px-1.5 py-1.5 text-gray-800 tabular-nums text-xs">
              {Object.values(shoppingByDay)
                .reduce((a, b) => a + b, 0)
                .toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
