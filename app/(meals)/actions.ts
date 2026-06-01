import type {
  SheetData,
  MealEntry,
  ShoppingEntry,
  DepositEntry,
  MealPhase,
  RateType,
  MonthCreatePayload,
} from "./types";

// ── Stable mock IDs ────────────────────────────────────────────────────────
const MONTH_ID = "aaaaaaaa-0000-0000-0000-000000000001";
const MEMBER_1 = "bbbbbbbb-0000-0000-0000-000000000001";
const MEMBER_2 = "bbbbbbbb-0000-0000-0000-000000000002";
const MEMBER_3 = "bbbbbbbb-0000-0000-0000-000000000003";

const MEMBERS = [
  { id: MEMBER_1, name: "Abed Afnan" },
  { id: MEMBER_2, name: "Rafi Islam" },
  { id: MEMBER_3, name: "Karim Hossain" },
];

// ── Month configuration state ──────────────────────────────────────────────
// Switch rate_type to "fixed" and update phases to test fixed-rate mode
let _rateType: RateType = "dynamic";
let _phases: MealPhase[] = [
  {
    id: "ph-lunch",
    name: "Lunch",
    rate: 0,
    edit_start: "07:00",
    edit_end: "11:00",
  },
  {
    id: "ph-dinner",
    name: "Dinner",
    rate: 0,
    edit_start: "18:00",
    edit_end: "22:00",
  },
];

// Stores last created month's settings for "keep previous settings"
let _lastSettings: MonthCreatePayload | null = null;

let _monthStatus: "active" | "closed" = "active";

// ── Entry state ────────────────────────────────────────────────────────────
// Dynamic: counts = { total: N }
// Fixed:   counts = { [phaseId]: N }
let _entries: MealEntry[] = [
  { member_id: MEMBER_1, day_number: 1, counts: { total: 2 } },
  { member_id: MEMBER_2, day_number: 1, counts: { total: 1 } },
  { member_id: MEMBER_3, day_number: 1, counts: { total: 1 } },
  { member_id: MEMBER_1, day_number: 2, counts: { total: 2 } },
  { member_id: MEMBER_2, day_number: 2, counts: { total: 2 } },
  { member_id: MEMBER_1, day_number: 3, counts: { total: 1 } },
  { member_id: MEMBER_3, day_number: 3, counts: { total: 2 } },
];

let _shopping: ShoppingEntry[] = [
  {
    id: "sh-1",
    day_number: 1,
    amount: "850",
    note: "Vegetables & rice",
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  },
  {
    id: "sh-2",
    day_number: 2,
    amount: "620",
    note: "Chicken",
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  },
  {
    id: "sh-3",
    day_number: 3,
    amount: "390",
    note: null,
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  },
];

let _deposits: DepositEntry[] = [];

// ── Helpers ────────────────────────────────────────────────────────────────
function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function calcSummary(
  rateType: RateType,
  phases: MealPhase[],
  entries: MealEntry[],
  shopping: ShoppingEntry[],
  deposits: DepositEntry[],
) {
  const totalShopping = shopping.reduce((s, e) => s + Number(e.amount), 0);

  // Total meals = sum of all counts across all entries
  const totalMeals = entries.reduce(
    (s, e) => s + Object.values(e.counts).reduce((a, b) => a + b, 0),
    0,
  );

  const perMealCost =
    rateType === "dynamic" && totalMeals > 0
      ? +(totalShopping / totalMeals).toFixed(4)
      : 0;

  const memberSummary = MEMBERS.map((m) => {
    const myEntries = entries.filter((e) => e.member_id === m.id);

    let myMeals = 0;
    let myCost = 0;

    for (const e of myEntries) {
      for (const [phaseId, count] of Object.entries(e.counts)) {
        myMeals += count;
        if (rateType === "fixed") {
          const phase = phases.find((p) => p.id === phaseId);
          myCost += count * (phase?.rate ?? 0);
        }
      }
    }

    if (rateType === "dynamic") myCost = +(myMeals * perMealCost).toFixed(2);

    const myDeposit = deposits
      .filter((d) => d.member_id === m.id)
      .reduce((s, d) => s + Number(d.amount), 0);
    const balance = +(myCost - myDeposit).toFixed(2);

    return {
      ...m,
      total_meals: myMeals,
      meal_cost: myCost,
      total_deposit: myDeposit,
      balance,
    };
  });

  return {
    total_meals: totalMeals,
    total_shopping: totalShopping,
    per_meal_cost: perMealCost,
    member_summary: memberSummary,
  };
}

// ── fetchSheet ─────────────────────────────────────────────────────────────
export async function fetchSheet(
  sub_mess_id: string,
  year: number,
  month: number,
): Promise<SheetData | null> {
  await delay();

  const now = new Date();
  if (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)
  )
    return null;

  const { total_meals, total_shopping, per_meal_cost, member_summary } =
    calcSummary(_rateType, _phases, _entries, _shopping, _deposits);

  return {
    month: {
      id: MONTH_ID,
      sub_mess_id,
      year,
      month,
      status: _monthStatus,
      rate_type: _rateType,
      phases: _phases,
    },
    members: MEMBERS,
    entries: [..._entries],
    shopping: [..._shopping],
    deposits: [..._deposits],
    summary: { total_meals, total_shopping, per_meal_cost },
    member_summary,
  };
}

// ── createMonth ────────────────────────────────────────────────────────────
export async function createMonth(
  sub_mess_id: string,
  year: number,
  month: number,
  payload: MonthCreatePayload,
): Promise<SheetData> {
  await delay(300);

  // Save settings for "keep previous" on next month creation
  _lastSettings = payload;

  // Apply the new config and reset entries
  _rateType = payload.rate_type;
  _phases = payload.phases.map((p, i) => ({
    ...p,
    id: `ph-${i}-${Date.now()}`,
  }));
  _entries = [];
  _monthStatus = "active";

  const { total_meals, total_shopping, per_meal_cost, member_summary } =
    calcSummary(_rateType, _phases, _entries, _shopping, _deposits);

  return {
    month: {
      id: MONTH_ID,
      sub_mess_id,
      year,
      month,
      status: "active",
      rate_type: _rateType,
      phases: _phases,
    },
    members: MEMBERS,
    entries: [],
    shopping: [..._shopping],
    deposits: [..._deposits],
    summary: { total_meals, total_shopping, per_meal_cost },
    member_summary,
  };
}

// ── getPreviousSettings ────────────────────────────────────────────────────
export async function getPreviousSettings(): Promise<MonthCreatePayload | null> {
  await delay(100);
  return _lastSettings;
}

// ── upsertMealEntry ────────────────────────────────────────────────────────
export async function upsertMealEntry(body: {
  meal_month_id: string;
  member_id: string;
  day_number: number;
  phase_id: string; // "total" for dynamic, actual phase.id for fixed
  count: number;
}) {
  await delay(150);
  const existing = _entries.find(
    (e) => e.member_id === body.member_id && e.day_number === body.day_number,
  );
  if (existing) {
    existing.counts = { ...existing.counts, [body.phase_id]: body.count };
  } else {
    _entries.push({
      member_id: body.member_id,
      day_number: body.day_number,
      counts: { [body.phase_id]: body.count },
    });
  }
  return { success: true };
}

// ── Shopping ───────────────────────────────────────────────────────────────
export async function addShoppingEntry(body: {
  meal_month_id: string;
  day_number: number;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const entry: ShoppingEntry = {
    id: `sh-${Date.now()}`,
    day_number: body.day_number,
    amount: String(body.amount),
    note: body.note ?? null,
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  };
  _shopping.push(entry);
  return { success: true, data: entry };
}

export async function deleteShoppingEntry(id: string) {
  await delay(150);
  _shopping = _shopping.filter((s) => s.id !== id);
  return { success: true };
}

// ── Deposits ───────────────────────────────────────────────────────────────
export async function addDepositEntry(body: {
  meal_month_id: string;
  member_id: string;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const entry: DepositEntry = {
    id: `dep-${Date.now()}`,
    member_id: body.member_id,
    amount: String(body.amount),
    note: body.note ?? null,
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  };
  _deposits.push(entry);
  return { success: true, data: entry };
}

export async function deleteDepositEntry(id: string) {
  await delay(150);
  _deposits = _deposits.filter((d) => d.id !== id);
  return { success: true };
}
