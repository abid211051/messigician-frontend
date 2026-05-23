export type FilterType = "all" | "today" | "week";

export interface FilterBtnProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export interface Images {
  url: string;
  public_id: string | null;
}

export interface RequestData {
  id: string;
  user_id: string;
  mess_id: string;
  sub_mess_id: string;
  created_at: string;
  sub_mess_name: string;
  fname: string;
  images: Images[] | null;
  phone: string | null;
  email: string | null;
}

export interface AcceptData {
  request_id: string;
  user_id: string;
  sub_mess_id: string;
}

export interface RejectData {
  request_id: string;
}
