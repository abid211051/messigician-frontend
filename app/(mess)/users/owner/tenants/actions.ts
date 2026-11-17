import api from "@/lib/axios";
import { FetchParams, FetchResult } from "./types";
import { EditTenantFormValues } from "./validation";
import { CUDResponse } from "@/lib/types/global";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { buildListQuery } from "@/lib/helpers/list-query";

export async function fetchTenants({
  page,
  limit,
  sub_mess_ids,
}: FetchParams): Promise<FetchResult> {
  const query = buildListQuery({
    page,
    limit: limit ?? DEFAULT_PAGE_SIZE,
    sub_mess_ids:
      sub_mess_ids.size > 0 ? Array.from(sub_mess_ids).join(",") : undefined,
  });
  const res = await api.get(`/tenants?${query}`);
  return res.data?.data ?? [];
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
