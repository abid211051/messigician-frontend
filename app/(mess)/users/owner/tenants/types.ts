import { EditTenantFormValues } from "./validation";

export interface Image {
  url: string;
  public_id: string | null;
}

export interface TenantData {
  id: string;
  user_id: string;
  tenant_name: string;
  email: string | null;
  phone: string | null;
  sub_mess_id: string;
  sub_mess_name: string;
  monthly_rent: number;
  total_due: number;
  images: Array<Image>;
}

export interface SubMessOption {
  id: string;
  sub_mess_name: string;
}
export interface FetchParams {
  mess_id: string | undefined;
  page: number;
  sub_mess_ids: Set<string>;
}

export interface MetaData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface FetchResult {
  success: boolean;
  data: TenantData[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantData | null;
  subMesses: SubMessOption[];
  isLoading?: boolean;
  onSave: (id: string, values: EditTenantFormValues) => Promise<void>;
}
