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
  const { phases, status, rate_type } = month;
  const now = new Date();
  const isThisMonth =
    now.getFullYear() === month.year && now.getMonth() + 1 === month.month;
  const today = now.getDate();
  const daysInMonth = new Date(month.year, month.month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isClosed = status === "closed";
  const monthShort = new Date(month.year, month.month - 1, 1).toLocaleString(
    "default",
    { month: "short" },
  );

  const phaseWindowMap = useMemo(() => {
    const t = currentHHMM();
    return Object.fromEntries(
      phases.map((p) => [
        p.id,
        !isClosed && t >= p.edit_start && t <= p.edit_end,
      ]),
    );
  }, [phases, isClosed]);

  const entryMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of entries)
      for (const [pId, cnt] of Object.entries(e.counts))
        m[`${e.member_id}-${e.day_number}-${pId}`] = cnt;
    return m;
  }, [entries]);

  const memberTotals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const e of entries)
      t[e.member_id] =
        (t[e.member_id] ?? 0) +
        Object.values(e.counts).reduce((a, b) => a + b, 0);
    return t;
  }, [entries]);

  const phaseTotals = useMemo(() => {
    const t: Record<string, number> = {};
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

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white mb-3">
      {/*
        w-full: fills the container on large screens (no blank space to the right)
        No fixed cell widths: only min-w on headers so cells expand naturally on desktop
        min-w on header cells: ensures minimum size on narrow mobile screens
      */}
      <table className="w-full border-collapse text-xs">
        <thead>
          {/* Row 1: Day | Member names | Shop */}
          <tr className="border-b border-gray-100 bg-gray-50">
            <th
              className={`${STICKY} bg-gray-50 px-3 py-3 text-left ${HDR} border-r border-gray-100 min-w-[80px]`}
            >
              Day
            </th>
            {members.map((m) => (
              <th
                key={m.id}
                colSpan={phases.length}
                className={`px-2 py-2.5 text-center ${HDR} border-r border-gray-100 last:border-r-0 min-w-[${phases.length * 72}px]`}
              >
                <span className="block" title={m.name}>
                  {m.name.split(" ")[0]}
                </span>
              </th>
            ))}
            <th className={`px-2 py-2.5 text-center ${HDR} min-w-[90px]`}>
              Shop (৳)
            </th>
          </tr>

          {/* Row 2: Phase subheaders */}
          <tr className="border-b border-gray-100 bg-gray-50">
            <th
              className={`${STICKY} bg-gray-50 px-3 py-1.5 border-r border-gray-100 min-w-[80px]`}
            />
            {members.flatMap((m) =>
              phases.map((p, pi) => (
                <th
                  key={`${m.id}-${p.id}`}
                  className={`px-2 py-1.5 text-center text-[10px] font-medium text-gray-400 min-w-[72px] ${
                    pi === phases.length - 1 ? "border-r border-gray-100" : ""
                  }`}
                  title={
                    rate_type === "fixed"
                      ? `${p.name} · ৳${p.rate}/meal`
                      : p.name
                  }
                >
                  {p.name.length > 7 ? p.name.slice(0, 6) + "…" : p.name}
                  {rate_type === "fixed" && (
                    <span className="block text-[9px] text-gray-300 font-normal">
                      ৳{p.rate}
                    </span>
                  )}
                </th>
              )),
            )}
            <th className="min-w-[90px]" />
          </tr>
        </thead>

        <tbody>
          {days.map((day) => {
            const isToday = isThisMonth && day === today;
            return (
              <tr
                key={day}
                className={`border-b border-gray-50 last:border-b-0 ${isToday ? "bg-blue-50/40" : ""}`}
              >
                {/* Solid bg on sticky cell to block scroll bleed-through */}
                <td
                  className={`${STICKY} px-3 py-1 border-r border-gray-100 whitespace-nowrap min-w-[80px] ${
                    isToday
                      ? "bg-blue-50 text-blue-600"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <span className="font-medium text-xs">
                    {day} {monthShort}
                  </span>
                  {isToday && (
                    <span className="block text-[8px] text-blue-400 font-semibold leading-none mt-0.5">
                      today
                    </span>
                  )}
                </td>

                {members.flatMap((m) =>
                  phases.map((p, pi) => {
                    const value = entryMap[`${m.id}-${day}-${p.id}`] ?? 0;
                    const canEdit =
                      isOwner ||
                      (m.id === currentUserId &&
                        isToday &&
                        phaseWindowMap[p.id]);
                    return (
                      <td
                        key={`${m.id}-${p.id}`}
                        className={`p-0 min-w-[72px] ${pi === phases.length - 1 ? "border-r border-gray-100" : ""} ${isToday ? "bg-blue-50/40" : ""}`}
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

                <td
                  className={`px-2 py-1.5 text-center text-gray-600 tabular-nums text-xs min-w-[90px] ${isToday ? "bg-blue-50/40" : ""}`}
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

          {/* Totals */}
          <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
            <td
              className={`${STICKY} bg-gray-50 px-3 py-2 text-gray-700 border-r border-gray-200 text-xs min-w-[80px]`}
            >
              Total
            </td>
            {members.flatMap((m) =>
              phases.map((p, pi) => (
                <td
                  key={`${m.id}-${p.id}`}
                  className={`text-center px-2 py-2 text-gray-800 tabular-nums text-xs min-w-[72px] ${
                    pi === phases.length - 1 ? "border-r border-gray-100" : ""
                  }`}
                >
                  {phaseTotals[`${m.id}-${p.id}`] ?? 0}
                </td>
              )),
            )}
            <td className="text-center px-2 py-2 text-gray-800 tabular-nums text-xs min-w-[90px]">
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
