export type RateType = "dynamic" | "fixed";

export interface MealPhase {
  id: string;
  name: string;
  rate: number; // ৳/meal — used only when sheet rate_type is "fixed"
  edit_start: string; // "HH:MM"
  edit_end: string; // "HH:MM"
  // rate_type intentionally NOT here — the sheet owns this decision
}

export interface MealMonth {
  id: string;
  sub_mess_id: string;
  year: number;
  month: number;
  status: "active" | "closed";
  rate_type: RateType; // one decision for the whole sheet
  phases: MealPhase[];
}

export interface MealMember {
  id: string;
  name: string;
}

// counts keys:
//   dynamic sheet → phaseId (e.g. "ph-lunch")
//   fixed sheet   → phaseId (same — no special "total" key)
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
    per_meal_cost: number; // meaningful only when rate_type === "dynamic"
  };
  member_summary: MemberSummary[];
}

export interface MonthCreatePayload {
  rate_type: RateType; // sheet-level
  phases: Omit<MealPhase, "id">[];
}
