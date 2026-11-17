import api from "@/lib/axios";
import { FetchSubMessesParams } from "./types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { buildListQuery } from "@/lib/helpers/list-query";

export interface CreateSubMessBody {
  fname: string;
  total_rent?: number;
  no_of_seats?: number;
}

export async function fetchSubMesses({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: FetchSubMessesParams) {
  const query = buildListQuery({
    page: page ?? 1,
    limit: limit ?? DEFAULT_PAGE_SIZE,
    search,
    sortBy,
    sortOrder,
  });
  const res = await api.get(`/sub-mess/all?${query}`);

  return res.data.data;
}

export async function fetchAllSubMesses() {
  const res = await api.get("/sub-mess/all");
  return res.data?.data ?? [];
}

export async function fetchSingleSubMess(id: string) {
  const res = await api.get(`/sub-mess/${id}`);
  return res.data.data;
}

export async function createSubMess(mess_id: string, body: CreateSubMessBody) {
  const res = await api.post(`/sub-mess`, body);
  return res.data;
}

export async function deleteSubMesses(ids: Set<string>) {
  if (ids.size === 0) return;
  if (ids.size === 1) {
    const [id] = ids;
    await api.delete(`/sub-mess/single/${id}`);
  } else {
    await api.delete("/sub-mess/bulk", { data: { ids: [...ids] } });
  }
}
