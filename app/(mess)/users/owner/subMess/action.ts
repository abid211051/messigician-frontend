import api from "@/lib/axios";
import { FetchSubMessesParams } from "./types";

const DEFAULT_PAGE_SIZE = 10;

// ── Fetch all sub-messes ───────────────────────────────────────────────────
export async function fetchSubMesses({
  mess_id,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: FetchSubMessesParams) {
  const params = new URLSearchParams();
  if (page && page > 1) params.set("page", String(page));
  if (limit && limit !== DEFAULT_PAGE_SIZE) params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (sortBy && sortBy !== "created_at") params.set("sortBy", sortBy);
  if (sortOrder && sortOrder !== "desc") params.set("sortOrder", sortOrder);

  const qs = params.toString();
  const url = `/sub-mess/all/${mess_id}${qs ? `?${qs}` : ""}`;
  const response = await api.get(url);
  return response.data;
}

// ── Create a new sub-mess ──────────────────────────────────────────────────
export interface CreateSubMessBody {
  fname: string;
  total_rent?: number;
  no_of_seats?: number;
}

export async function createSubMess(mess_id: string, body: CreateSubMessBody) {
  const response = await api.post(`/sub-mess/${mess_id}`, body);
  return response.data;
}

// ── Delete — single or bulk decided by set size ────────────────────────────
export async function deleteSubMesses(ids: Set<string>) {
  if (ids.size === 0) return;
  if (ids.size === 1) {
    const [id] = ids;
    await api.delete(`/sub-mess/single/${id}`);
  } else {
    await api.delete("/sub-mess/bulk", { data: { ids: [...ids] } });
  }
}
