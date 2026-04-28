"use client";

import { FilterBtnProps } from "./types";

export default function FilterBtn({ filter, onFilterChange }: FilterBtnProps) {
  return (
    <>
      {(["all", "today", "week"] as const).map((item) => (
        <button
          key={item}
          onClick={() => onFilterChange(item)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === item
              ? "bg-brand-primary text-white"
              : "bg-card text-gray-700"
          }`}
        >
          {item === "all" ? "All" : item === "today" ? "Today" : "This Week"}
        </button>
      ))}
    </>
  );
}
