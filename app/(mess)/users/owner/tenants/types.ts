// app/users/owner/tenants/types.ts
export interface TenantData {
  id: string;
  user_id: string;
  fname: string;
  email: string;
  phone: string | null;
  sub_mess_id: string;
  sub_mess_name: string;
  rent_amount: number;
  image_url: string | null;
}

export interface SubMessOption {
  id: string;
  name: string;
}
