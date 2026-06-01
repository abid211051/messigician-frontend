export type RateType = "dynamic" | "fixed";

export interface MealPhase {
  id: string;
  name: string;
  rate_type: RateType; // per-phase — no longer at sheet level
  rate: number; // ৳/meal; ignored when rate_type is "dynamic"
  edit_start: string; // "HH:MM"
  edit_end: string; // "HH:MM"
}

export interface MealMonth {
  id: string;
  sub_mess_id: string;
  year: number;
  month: number;
  status: "active" | "closed";
  // rate_type removed — each phase now owns its own
  phases: MealPhase[];
}

export interface MealMember {
  id: string;
  name: string;
}

export interface MealEntry {
  member_id: string;
  day_number: number;
  counts: Record<string, number>; // phaseId → count
}

export interface ShoppingEntry {
  id: string;
  day_number: number;
  amount: string;
  note: string | null;
  added_by: string;
  created_at: string;
}

export interface DepositEntry {
  id: string;
  member_id: string;
  amount: string;
  note: string | null;
  added_by: string;
  created_at: string;
}

export interface MemberSummary {
  id: string;
  name: string;
  total_meals: number;
  meal_cost: number;
  total_deposit: number;
  balance: number;
}

export interface SheetData {
  month: MealMonth;
  members: MealMember[];
  entries: MealEntry[];
  shopping: ShoppingEntry[];
  deposits: DepositEntry[];
  summary: {
    total_meals: number;
    total_shopping: number;
    per_meal_cost: number; // total_shopping / total_meals — used by dynamic phases
  };
  member_summary: MemberSummary[];
}

export interface MonthCreatePayload {
  phases: Omit<MealPhase, "id">[];
}
