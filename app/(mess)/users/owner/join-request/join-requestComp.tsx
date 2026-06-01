"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCircle, Clock, Mail, Phone, Building2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  acceptJoinRequest,
  getAllJoinRequests,
  rejectJoinRequest,
} from "./actions";
import { getAvatarColor, getInitials } from "@/lib/helpers/avatar";
import { aproxTimeAgo } from "@/lib/helpers/time"; // move the function here
import FilterBtn from "./filterBtn";
import Image from "next/image";
import { toast } from "sonner";
import { AcceptData, FilterType, RejectData, RequestData } from "./types";
import ListLoading from "@/components/ui/ListLoading";

const TOAST_OPTIONS = { position: "top-center", richColors: true } as const;

export default function JoinRequestsClient() {
  const messId = useAuthStore((s) => s.user?.mess_id);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchRequests = useCallback(async () => {
    if (!messId) return;
    setIsLoading(true);
    try {
      const res = await getAllJoinRequests(messId);
      setRequests(res.data.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.message ?? "Failed to load join requests",
        TOAST_OPTIONS,
      );
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [messId]);

  useEffect(() => {
    fetchRequests();
  }, [messId]);

  const handleAccept = async (payload: AcceptData) => {
    setIsAccepting(payload.request_id);
    try {
      const res = await acceptJoinRequest(payload);
      toast.success(res.data.message, TOAST_OPTIONS);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to accept request", TOAST_OPTIONS);
    } finally {
      setIsAccepting(null);
    }
  };

  const handleReject = async (payload: RejectData) => {
    setIsRejecting(payload.request_id);
    try {
      const res = await rejectJoinRequest(payload.request_id);
      toast.success(res.data.message, TOAST_OPTIONS);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reject request", TOAST_OPTIONS);
    } finally {
      setIsRejecting(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;

    const created = new Date(r.created_at);
    const now = new Date();

    if (filter === "today") {
      return created.toDateString() === now.toDateString();
    }

    if (filter === "week") {
      const diffDays =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <ListLoading key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-3 overflow-x-auto">
        <FilterBtn filter={filter} onFilterChange={setFilter} />
      </div>

      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <UserCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No pending requests
            </h3>
            <p className="text-sm text-gray-500">
              New join requests will appear here
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-card rounded-xl overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(request.fname)} flex items-center justify-center text-white font-semibold text-lg shrink-0 overflow-clip`}
                  >
                    {request.images?.[0]?.url ? (
                      <Image
                        src={request.images[0].url}
                        alt={request.fname}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(request.fname)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {request.fname}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{aproxTimeAgo(request.created_at)}</span>
                    </div>
                    {request.sub_mess_name && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">
                          {request.sub_mess_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-600 truncate">
                      {request.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-600 truncate">
                      {request.phone || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex border-t">
                <button
                  onClick={() => handleReject({ request_id: request.id })}
                  disabled={
                    isAccepting === request.id || isRejecting === request.id
                  }
                  className="flex-1 py-3 text-sm text-destructive transition active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isRejecting === request.id ? "Rejecting..." : "Reject"}
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() =>
                    handleAccept({
                      request_id: request.id,
                      user_id: request.user_id,
                      sub_mess_id: request.sub_mess_id,
                    })
                  }
                  disabled={
                    isAccepting === request.id || isRejecting === request.id
                  }
                  className="flex-1 py-3 text-sm text-secondary transition active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isAccepting === request.id ? "Accepting..." : "Accept"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
