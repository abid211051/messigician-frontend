"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCircle, Clock, Mail, Phone, Building2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { useAuthStore } from "@/lib/stores/auth.store";

import { getAvatarColor, getInitials } from "@/lib/helpers/avatar";
import { aproxTimeAgo } from "@/lib/helpers/time";

import {
  acceptJoinRequest,
  getAllJoinRequests,
  rejectJoinRequest,
} from "./actions";

import type { AcceptData, FilterType, RequestData } from "./types";

import FilterBtn from "./filterBtn";
import ListLoading from "@/components/ui/ListLoading";
import { handleApiError } from "@/lib/helpers/errors";

const TOAST_OPTIONS = {
  position: "top-center",
  richColors: true,
} as const;

type AcceptPayload = Pick<AcceptData, "request_id" | "sub_mess_id">;

export default function JoinRequestsClient() {
  const messId = useAuthStore((s) => s.user?.mess_id);

  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchRequests = useCallback(async () => {
    if (!messId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await getAllJoinRequests();
      setRequests(data);
    } catch (error: unknown) {
      handleApiError(error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [messId]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (payload: AcceptPayload) => {
    setIsAccepting(payload.request_id);

    try {
      const result = await acceptJoinRequest(payload);

      toast.success(result.message, TOAST_OPTIONS);

      await fetchRequests();
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsAccepting(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsRejecting(requestId);

    try {
      const result = await rejectJoinRequest(requestId);

      toast.success(result.message, TOAST_OPTIONS);

      await fetchRequests();
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsRejecting(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;

    const created = new Date(request.created_at);
    const now = new Date();

    if (Number.isNaN(created.getTime())) return false;

    if (filter === "today") {
      return created.toDateString() === now.toDateString();
    }

    if (filter === "week") {
      const diffDays =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

      return diffDays >= 0 && diffDays <= 7;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, index) => (
          <ListLoading key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto">
        <FilterBtn filter={filter} onFilterChange={setFilter} />
      </div>

      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center">
            <UserCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />

            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              No pending requests
            </h3>

            <p className="text-sm text-gray-500">
              New join requests will appear here
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const displayName = request.fname || "Unknown user";
            const isProcessing =
              isAccepting === request.id || isRejecting === request.id;

            return (
              <div
                key={request.id}
                className="overflow-hidden rounded-xl bg-card"
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-semibold text-white ${getAvatarColor(displayName)}`}
                    >
                      {request.images?.[0]?.url ? (
                        <Image
                          src={request.images[0].url}
                          alt={displayName}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {displayName}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{aproxTimeAgo(request.created_at)}</span>
                      </div>

                      {request.sub_mess_name && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">
                            {request.sub_mess_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                      <span className="truncate text-gray-600">
                        {request.email || "No email provided"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                      <span className="truncate text-gray-600">
                        {request.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex border-t">
                  <button
                    type="button"
                    onClick={() => void handleReject(request.id)}
                    disabled={isProcessing}
                    className="flex-1 py-3 text-sm text-destructive transition active:scale-90 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isRejecting === request.id ? "Rejecting..." : "Reject"}
                  </button>

                  <div className="w-px bg-border" />

                  <button
                    type="button"
                    onClick={() =>
                      void handleAccept({
                        request_id: request.id,
                        sub_mess_id: request.sub_mess_id,
                      })
                    }
                    disabled={isProcessing}
                    className="flex-1 py-3 text-sm text-secondary transition active:scale-90 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isAccepting === request.id ? "Accepting..." : "Accept"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
