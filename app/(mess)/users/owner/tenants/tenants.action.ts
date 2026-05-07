import api from "@/lib/axios";
import { FetchParams, FetchResult, SubMessOption } from "./types";

export async function fetchSubMesses(
  mess_id: string,
): Promise<SubMessOption[]> {
  const res = await api.get(`/tenants/sub-mess/all/${mess_id}`);
  return res.data?.data ?? [];
}

export async function fetchTenants({
  mess_id,
  page,
  sub_mess_ids,
}: FetchParams): Promise<FetchResult> {
  const processedSubMessIds =
    sub_mess_ids.size > 0 ? Array.from(sub_mess_ids).join(",") : "";

  const res = await api.get(
    `/tenants/${mess_id}?page=${page}&sub_mess_ids=${processedSubMessIds}`,
  );
  return res.data;
}
