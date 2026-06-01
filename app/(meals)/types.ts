export type RateType = "dynamic" | "fixed";

export interface MealPhase {
  id: string;
  name: string;
  rate: number; // ৳/meal; 0 for dynamic (ignored in cost calc)
  edit_start: string; // "HH:MM"
  edit_end: string; // "HH:MM"
}

export interface MealMonth {
  id: string;
  sub_mess_id: string;
  year: number;
  month: number;
  status: "active" | "closed";
  rate_type: RateType;
  phases: MealPhase[];
}

export interface MealMember {
  id: string;
  name: string;
}

// Dynamic: counts = { "total": N }          — one key
// Fixed:   counts = { [phaseId]: N, ... }   — one key per phase
export interface MealEntry {
  member_id: string;
  day_number: number;
  counts: Record<string, number>;
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
  balance: number; // positive = owes mess, negative = mess owes them
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
    per_meal_cost: number; // 0 when fixed rate (not applicable)
  };
  member_summary: MemberSummary[];
}

// Payload for StartMonthDialog → createMonth action
export interface MonthCreatePayload {
  rate_type: RateType;
  phases: Omit<MealPhase, "id">[];
}
