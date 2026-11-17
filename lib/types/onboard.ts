export interface Submess {
  id: string;
  name: string;
}

export interface MessSearchResult {
  id: string;
  name: string;
  mess_id: string;
  no_of_seats: number;
  no_of_members: number;
  available_seats: number;
  is_full: boolean;
}
