import MealsClient from "@/components/meals/meals-client";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";

export default async function OwnerSubMessMealsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <MealsClient subMessId={id} isOwner={true} />
    </div>
  );
}
