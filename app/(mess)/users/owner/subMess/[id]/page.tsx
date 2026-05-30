import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import SubMessPanelClient from "./sub-mess-panel-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubMessPanelPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <div className={`pb-24 ${SYSTEM_WIDE_PADDING}`}>
      <SubMessPanelClient subMessId={resolvedParams.id} />
    </div>
  );
}
