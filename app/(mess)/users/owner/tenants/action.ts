import api from "@/lib/axios";
import { FetchParams, FetchResult, SubMessOption } from "./types";
import { EditTenantFormValues } from "./validation";
import { CUDResponse } from "@/lib/types/global";

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

export async function deleteTenants(tenantIds: Set<string>): Promise<void> {
  const idsArray = Array.from(tenantIds);
  let res = null;
  if (idsArray.length > 1) {
    res = await api.delete(`/tenants/bulk`, {
      data: { ids: idsArray },
    });
  } else {
    res = await api.delete(`/tenants/single/${idsArray[0]}`);
  }
  return res.data;
}

export async function updateTenant(
  id: string,
  values: EditTenantFormValues,
): Promise<CUDResponse> {
  const res = await api.put(`/tenants/edit/${id}`, values);
  return res.data;
}
