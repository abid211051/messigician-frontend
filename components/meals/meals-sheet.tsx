"use client";

import { useMemo } from "react";
import MealCell from "./meals-cell";
import type { SheetData, MealPhase } from "@/app/(meals)/types";

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

function isInAnyWindow(phases: MealPhase[]): boolean {
  const t = currentHHMM();
  return phases.some((p) => t >= p.edit_start && t <= p.edit_end);
}

function isInPhaseWindow(phase: MealPhase): boolean {
  const t = currentHHMM();
  return t >= phase.edit_start && t <= phase.edit_end;
}

export default function MealSheet({
  data,
  isOwner,
  currentUserId,
  onCellChange,
}: Props) {
  const { month, members, entries, shopping } = data;
  const { phases, rate_type, status } = month;
  const today = new Date().getDate();
  const daysInMonth = new Date(month.year, month.month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isClosed = status === "closed";

  // Memoised checks (computed once per render, not per cell)
  const memberCanEditNow = useMemo(
    () => !isClosed && isInAnyWindow(phases),
    [isClosed, phases],
  );
  const phaseWindowMap = useMemo(
    () =>
      Object.fromEntries(
        phases.map((p) => [p.id, !isClosed && isInPhaseWindow(p)]),
      ),
    [isClosed, phases],
  );

  // entry lookup: "memberId-day-phaseId" → count
  const entryMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of entries) {
      for (const [pId, cnt] of Object.entries(e.counts)) {
        m[`${e.member_id}-${e.day_number}-${pId}`] = cnt;
      }
    }
    return m;
  }, [entries]);

  // Total meals per member (for totals row)
  const memberTotals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const e of entries) {
      t[e.member_id] =
        (t[e.member_id] ?? 0) +
        Object.values(e.counts).reduce((a, b) => a + b, 0);
    }
    return t;
  }, [entries]);

  // Total per member per phase (fixed totals row)
  const phaseTotals = useMemo(() => {
    const t: Record<string, number> = {}; // "memberId-phaseId"
    for (const e of entries) {
      for (const [pId, cnt] of Object.entries(e.counts)) {
        const k = `${e.member_id}-${pId}`;
        t[k] = (t[k] ?? 0) + cnt;
      }
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
  const CELL_W = rate_type === "dynamic" ? "min-w-[72px]" : "min-w-[52px]";

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white mb-3">
      <table className="border-collapse text-xs w-full">
        <thead>
          {/* ── Row 1 ── */}
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th
              className={`${STICKY} bg-gray-50/60 px-2 py-2.5 text-left ${HDR} border-r border-gray-100 min-w-[44px]`}
            >
              Day
            </th>

            {rate_type === "dynamic" &&
              members.map((m) => (
                <th
                  key={m.id}
                  className={`${CELL_W} px-1.5 py-2.5 text-center ${HDR} border-r border-gray-100 last:border-r-0`}
                >
                  <span
                    className="truncate block max-w-[68px] mx-auto"
                    title={m.name}
                  >
                    {m.name.split(" ")[0]}
                  </span>
                </th>
              ))}

            {rate_type === "fixed" &&
              members.map((m) => (
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

          {/* ── Row 2: phase sub-headers (fixed only) ── */}
          {rate_type === "fixed" && (
            <tr className="border-b border-gray-100 bg-gray-50/30">
              <th
                className={`${STICKY} bg-gray-50/30 px-2 py-1 border-r border-gray-100`}
              />
              {members.flatMap((m) =>
                phases.map((p, pi) => (
                  <th
                    key={`${m.id}-${p.id}`}
                    className={`${CELL_W} px-1 py-1 text-center text-[9px] text-gray-400 font-medium ${pi === phases.length - 1 ? "border-r border-gray-100" : ""}`}
                    title={`${p.name} · ৳${p.rate}/meal`}
                  >
                    {p.name.slice(0, 3)}
                    <span className="ml-0.5 text-gray-300">·{p.rate}</span>
                  </th>
                )),
              )}
              <th />
            </tr>
          )}
        </thead>

        <tbody>
          {days.map((day) => {
            const isToday = day === today;
            return (
              <tr
                key={day}
                className={`border-b border-gray-50 last:border-b-0 ${isToday ? "bg-blue-50/30" : ""}`}
              >
                {/* Day label */}
                <td
                  className={`${STICKY} bg-white px-2 py-0.5 border-r border-gray-100 font-medium whitespace-nowrap text-gray-600 ${isToday ? "text-blue-600" : ""}`}
                >
                  {day}
                  {isToday && (
                    <span className="ml-1 text-[8px] text-blue-400 font-semibold align-middle">
                      today
                    </span>
                  )}
                </td>

                {/* ── Dynamic: one cell per member ── */}
                {rate_type === "dynamic" &&
                  members.map((m) => {
                    const value = entryMap[`${m.id}-${day}-total`] ?? 0;
                    const canEdit =
                      isOwner ||
                      (m.id === currentUserId && isToday && memberCanEditNow);
                    return (
                      <td
                        key={m.id}
                        className="border-r border-gray-100 last:border-r-0 p-0"
                      >
                        <MealCell
                          monthId={month.id}
                          memberId={m.id}
                          dayNumber={day}
                          phaseId="total"
                          value={value}
                          canEdit={canEdit}
                          isClosed={!isOwner && isClosed}
                          onSuccess={(c) => onCellChange(m.id, day, "total", c)}
                        />
                      </td>
                    );
                  })}

                {/* ── Fixed: one cell per phase per member ── */}
                {rate_type === "fixed" &&
                  members.flatMap((m, mi) =>
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
                          className={`p-0 ${isLastPhase ? "border-r border-gray-100" : ""}`}
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

                {/* Shopping */}
                <td className="px-1.5 py-1.5 text-center text-gray-600 tabular-nums">
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

            {rate_type === "dynamic" &&
              members.map((m) => (
                <td
                  key={m.id}
                  className="text-center px-1.5 py-1.5 border-r border-gray-100 last:border-r-0 text-gray-800 tabular-nums text-xs"
                >
                  {memberTotals[m.id] ?? 0}
                </td>
              ))}

            {rate_type === "fixed" &&
              members.flatMap((m, mi) =>
                phases.map((p, pi) => {
                  const isLastPhase = pi === phases.length - 1;
                  return (
                    <td
                      key={`${m.id}-${p.id}`}
                      className={`text-center px-1.5 py-1.5 text-gray-800 tabular-nums text-xs ${isLastPhase ? "border-r border-gray-100" : ""}`}
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
