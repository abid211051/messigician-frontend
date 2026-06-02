"use client";

import type { MemberSummary, RateType } from "@/app/(meals)/types";

interface Props {
  rateType: RateType;
  summary: {
    total_meals: number;
    total_shopping: number;
    per_meal_cost: number;
  };
  memberSummary: MemberSummary[];
  currentUserId: string;
}

export default function SummaryBar({
  rateType,
  summary,
  memberSummary,
  currentUserId,
}: Props) {
  const { total_meals, total_shopping, per_meal_cost } = summary;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-3">
      {/* Month-level stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <Stat label="Total Meals" value={String(total_meals)} />
        <Stat
          label="Total Shopping"
          value={`৳ ${total_shopping.toLocaleString()}`}
        />
        <Stat
          label="Per Meal"
          value={
            rateType === "fixed"
              ? "Fixed Rate"
              : per_meal_cost > 0
                ? `৳ ${per_meal_cost.toFixed(2)}`
                : "—"
          }
        />
      </div>

      {/* Per-member breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/60 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              <th className="text-left  px-3 py-2">Member</th>
              <th className="text-right px-3 py-2">Meals</th>
              <th className="text-right px-3 py-2">Cost (৳)</th>
              <th className="text-right px-3 py-2">Deposit (৳)</th>
              <th className="text-right px-3 py-2 min-w-[90px]">Balance</th>
            </tr>
          </thead>
          <tbody>
            {memberSummary.map((m) => {
              const isMe = m.id === currentUserId;
              return (
                <tr
                  key={m.id}
                  className={`border-t border-gray-50 ${isMe ? "bg-blue-50/30" : ""}`}
                >
                  <td className="px-3 py-1.5 text-gray-800 font-medium">
                    {m.name}
                    {isMe && (
                      <span className="ml-1 text-[9px] text-blue-400 font-normal">
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                    {m.total_meals}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                    {m.meal_cost > 0
                      ? `৳ ${m.meal_cost.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                    {m.total_deposit > 0
                      ? `৳ ${m.total_deposit.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-semibold">
                    {m.balance === 0 ? (
                      <span className="text-gray-400 font-normal">Settled</span>
                    ) : m.balance > 0 ? (
                      <span className="text-red-500">
                        +৳ {m.balance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        −৳ {Math.abs(m.balance).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center gap-4 px-3 py-2 border-t border-gray-50 bg-gray-50/40">
          <span className="text-[10px] text-gray-400">
            <span className="text-red-400 font-semibold">+৳</span> = owes the
            mess
          </span>
          <span className="text-[10px] text-gray-400">
            <span className="text-green-500 font-semibold">−৳</span> = mess owes
            them
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center py-2.5 px-2">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900 tabular-nums leading-tight">
        {value}
      </span>
    </div>
  );
}
