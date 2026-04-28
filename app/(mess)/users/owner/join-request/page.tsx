import BackButton from "@/components/ui/back";
import JoinRequestsClient from "./join-requestComp";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";

export default function JoinRequestPage() {
  return (
    <div className={`min-h-screen pb-20 ${SYSTEM_WIDE_PADDING}`}>
      <div className="relative flex items-center justify-center py-2 mb-3">
        <BackButton />
        <h1 className="text-lg font-bold text-gray-900">Join Requests</h1>
      </div>
      <JoinRequestsClient />
    </div>
  );
}
