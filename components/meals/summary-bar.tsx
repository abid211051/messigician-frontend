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
      {/* Top stats — scrollable so large numbers don't overflow */}
      <div className="overflow-x-auto border-b border-gray-100">
        <div className="flex divide-x divide-gray-100 min-w-[300px]">
          <Stat label="Total Meals" value={String(total_meals)} />
          <Stat
            label="Shopping"
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
      </div>

      {/* Member breakdown — w-full fills desktop, min-w ensures scrollable on mobile */}
      <div className="overflow-x-auto w-full">
        <table
          className="w-full border-collapse text-xs"
          style={{ minWidth: "500px" }}
        >
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              <th className="text-left  px-4 py-2.5 min-w-[130px]">Member</th>
              <th className="text-right px-4 py-2.5 min-w-[60px]">Meals</th>
              <th className="text-right px-4 py-2.5 min-w-[100px]">
                Meal Cost
              </th>
              <th className="text-right px-4 py-2.5 min-w-[100px]">Deposit</th>
              <th className="text-right px-4 py-2.5 min-w-[110px]">Balance</th>
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
                  <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">
                    {m.name}
                    {isMe && (
                      <span className="ml-1.5 text-[9px] text-blue-400 font-normal">
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap">
                    {m.total_meals}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap">
                    {m.meal_cost > 0
                      ? `৳ ${m.meal_cost.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-700 whitespace-nowrap">
                    {m.total_deposit > 0
                      ? `৳ ${m.total_deposit.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold whitespace-nowrap">
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
          <tfoot>
            <tr className="border-t border-gray-100 bg-gray-50/60">
              <td colSpan={5} className="px-4 py-2">
                <span className="flex gap-4 text-[10px] text-gray-400">
                  <span>
                    <span className="text-red-400 font-semibold">+৳</span> owes
                    the mess
                  </span>
                  <span>
                    <span className="text-green-500 font-semibold">−৳</span>{" "}
                    mess owes them
                  </span>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col items-center py-3 px-3 min-w-[100px]">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}
