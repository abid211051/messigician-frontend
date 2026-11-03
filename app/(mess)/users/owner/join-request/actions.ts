import api from "@/lib/axios";
import type { AcceptData, RequestData } from "./types";
import { ApiSuccessResponse, MessageResponse } from "@/lib/types/apiResType";

type AcceptPayload = Pick<AcceptData, "request_id" | "sub_mess_id">;

export async function getAllJoinRequests(): Promise<RequestData[]> {
  const res = await api.get<ApiSuccessResponse<RequestData[]>>("/join-request");

  const data = res.data.data;

  if (!Array.isArray(data)) {
    throw new Error("Invalid join requests response");
  }

  return data;
}

export async function acceptJoinRequest(
  payload: AcceptPayload,
): Promise<MessageResponse> {
  const res = await api.post<ApiSuccessResponse<MessageResponse>>(
    "/join-request/accept",
    payload,
  );

  return res.data.data;
}

export async function rejectJoinRequest(
  requestId: string,
): Promise<MessageResponse> {
  const res = await api.delete<ApiSuccessResponse<MessageResponse>>(
    `/join-request/reject/${requestId}`,
  );

  return res.data.data;
}
