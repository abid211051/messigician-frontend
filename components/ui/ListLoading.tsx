"use client";
export default function ListLoading() {
  return (
    <div className="bg-card rounded-xl p-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
