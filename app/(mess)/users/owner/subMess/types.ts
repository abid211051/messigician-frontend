export interface SubMessData {
  id: string;
  sub_mess_name: string;
  created_at: string;
  total_rent: string;
  total_utility: string;
  no_of_seats: number;
  no_of_members: string;
}

export interface FetchSubMessesParams {
  mess_id: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "created_at" | "total_rent" | "no_of_members";
  sortOrder?: "asc" | "desc";
}

export type SortBy = "created_at" | "total_rent" | "no_of_members";
export type SortOrder = "asc" | "desc";
