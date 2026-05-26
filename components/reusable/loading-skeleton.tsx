"use client";

interface PageSkeletonProps {
  count?: number;
}
export function ListCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-3 animate-pulse">
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-2/5" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
        <div className="w-4 h-4 rounded bg-muted shrink-0 mt-0.5" />
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded-full w-8" />
        </div>
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function PageSkeleton({ count = 10 }: PageSkeletonProps) {
  const items = [...Array(count)].map((_, i) => <ListCardSkeleton key={i} />);

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">{items}</div>
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
        {items}
      </div>
    </>
  );
}
