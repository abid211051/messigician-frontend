import api from "@/lib/axios";
import { AcceptData } from "./types";

export const getAllJoinRequests = async (mess_id: string) => {
  const res = await api.get(`/join-request/${mess_id}`);
  return res;
};

export const acceptJoinRequest = async (payload: AcceptData) => {
  const res = await api.post(`/join-request/accept`, payload);
  return res;
};

export const rejectJoinRequest = async (request_id: string) => {
  const res = await api.delete(`/join-request/reject/${request_id}`);
  return res;
};
