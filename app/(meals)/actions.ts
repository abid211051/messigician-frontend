import type {
  SheetData,
  MealEntry,
  ShoppingEntry,
  DepositEntry,
  MealPhase,
  RateType,
  MonthCreatePayload,
} from "./types";

// ── Stable mock member IDs ─────────────────────────────────────────────────
const MEMBER_1 = "bbbbbbbb-0000-0000-0000-000000000001";
const MEMBER_2 = "bbbbbbbb-0000-0000-0000-000000000002";
const MEMBER_3 = "bbbbbbbb-0000-0000-0000-000000000003";

const MEMBERS = [
  { id: MEMBER_1, name: "Abed Afnan" },
  { id: MEMBER_2, name: "Rafi Islam" },
  { id: MEMBER_3, name: "Karim Hossain" },
];

// ── Default seed data (dynamic mode) ──────────────────────────────────────
// Note: MealPhase has NO rate_type — that lives on the sheet
const DEFAULT_PHASES: MealPhase[] = [
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

const DEFAULT_ENTRIES: MealEntry[] = [
  {
    member_id: MEMBER_1,
    day_number: 1,
    counts: { "ph-lunch": 1, "ph-dinner": 1 },
  },
  { member_id: MEMBER_2, day_number: 1, counts: { "ph-lunch": 1 } },
  { member_id: MEMBER_3, day_number: 1, counts: { "ph-dinner": 1 } },
  {
    member_id: MEMBER_1,
    day_number: 2,
    counts: { "ph-lunch": 1, "ph-dinner": 1 },
  },
  {
    member_id: MEMBER_2,
    day_number: 2,
    counts: { "ph-lunch": 1, "ph-dinner": 1 },
  },
  { member_id: MEMBER_1, day_number: 3, counts: { "ph-lunch": 1 } },
  {
    member_id: MEMBER_3,
    day_number: 3,
    counts: { "ph-lunch": 1, "ph-dinner": 1 },
  },
];

const DEFAULT_SHOPPING: ShoppingEntry[] = [
  {
    id: "sh-1",
    day_number: 1,
    entry_date: toISODate(new Date()),
    amount: "850",
    note: "Vegetables & rice",
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  },
  {
    id: "sh-2",
    day_number: 2,
    entry_date: toISODate(new Date()),
    amount: "620",
    note: "Chicken",
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  },
  {
    id: "sh-3",
    day_number: 3,
    entry_date: toISODate(new Date()),
    amount: "390",
    note: null,
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  },
];

// ── In-memory store ────────────────────────────────────────────────────────
type StoredMonth = SheetData;
const _months = new Map<string, StoredMonth>();
let _lastSettings: MonthCreatePayload | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────
function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthId(year: number, month: number) {
  return `month-${year}-${String(month).padStart(2, "0")}`;
}

function monthDiff(year: number, month: number) {
  const now = new Date();
  return (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayNumberFromDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getDate();
}

function getStoredMonthById(id: string): StoredMonth | null {
  for (const [, s] of _months) if (s.month.id === id) return s;
  return null;
}

// ── Core calculation ───────────────────────────────────────────────────────
// rate_type is sheet-level — no per-phase rate_type
function calcSummary(
  rateType: RateType,
  phases: MealPhase[],
  entries: MealEntry[],
  shopping: ShoppingEntry[],
  deposits: DepositEntry[],
) {
  const totalShopping = shopping.reduce((s, e) => s + Number(e.amount), 0);
  const totalMeals = entries.reduce(
    (s, e) => s + Object.values(e.counts).reduce((a, b) => a + b, 0),
    0,
  );

  // Dynamic: shopping ÷ ALL meals — clean, no leakage
  // Fixed:   per_meal_cost is 0 — individual costs come entirely from phase rates
  const perMealCost =
    rateType === "dynamic" && totalMeals > 0
      ? +(totalShopping / totalMeals).toFixed(4)
      : 0;

  const memberSummary = MEMBERS.map((m) => {
    let myMeals = 0;
    let myCost = 0;

    for (const e of entries.filter((e) => e.member_id === m.id)) {
      for (const [phaseId, count] of Object.entries(e.counts)) {
        myMeals += count;
        if (rateType === "fixed") {
          const phase = phases.find((p) => p.id === phaseId);
          myCost += count * (phase?.rate ?? 0);
        } else {
          myCost += count * perMealCost;
        }
      }
    }

    const myDeposit = deposits
      .filter((d) => d.member_id === m.id)
      .reduce((s, d) => s + Number(d.amount), 0);

    return {
      ...m,
      total_meals: myMeals,
      meal_cost: +myCost.toFixed(2),
      total_deposit: myDeposit,
      balance: +(myCost - myDeposit).toFixed(2),
    };
  });

  return {
    total_meals: totalMeals,
    total_shopping: totalShopping,
    per_meal_cost: perMealCost,
    member_summary: memberSummary,
  };
}

function buildSheet(
  sub_mess_id: string,
  year: number,
  month: number,
  rateType: RateType,
  phases: MealPhase[],
  entries: MealEntry[],
  shopping: ShoppingEntry[],
  deposits: DepositEntry[],
  status: "active" | "closed" = "active",
): StoredMonth {
  const { total_meals, total_shopping, per_meal_cost, member_summary } =
    calcSummary(rateType, phases, entries, shopping, deposits);
  return {
    month: {
      id: monthId(year, month),
      sub_mess_id,
      year,
      month,
      status,
      rate_type: rateType,
      phases: phases.map((p) => ({ ...p })),
    },
    members: MEMBERS.map((m) => ({ ...m })),
    entries: entries.map((e) => ({ ...e, counts: { ...e.counts } })),
    shopping: shopping.map((s) => ({ ...s })),
    deposits: deposits.map((d) => ({ ...d })),
    summary: { total_meals, total_shopping, per_meal_cost },
    member_summary,
  };
}

function snapshot(stored: StoredMonth): StoredMonth {
  const { total_meals, total_shopping, per_meal_cost, member_summary } =
    calcSummary(
      stored.month.rate_type,
      stored.month.phases,
      stored.entries,
      stored.shopping,
      stored.deposits,
    );
  return {
    month: {
      ...stored.month,
      phases: stored.month.phases.map((p) => ({ ...p })),
    },
    members: stored.members.map((m) => ({ ...m })),
    entries: stored.entries.map((e) => ({ ...e, counts: { ...e.counts } })),
    shopping: stored.shopping.map((s) => ({ ...s })),
    deposits: stored.deposits.map((d) => ({ ...d })),
    summary: { total_meals, total_shopping, per_meal_cost },
    member_summary,
  };
}

function seedCurrentMonth(sub_mess_id: string, year: number, month: number) {
  const now = new Date();
  if (year !== now.getFullYear() || month !== now.getMonth() + 1) return null;
  const key = monthKey(year, month);
  if (_months.has(key)) return _months.get(key)!;
  const s = buildSheet(
    sub_mess_id,
    year,
    month,
    "dynamic",
    DEFAULT_PHASES,
    DEFAULT_ENTRIES,
    DEFAULT_SHOPPING,
    [],
  );
  _months.set(key, s);
  return s;
}

// ── Public actions ─────────────────────────────────────────────────────────

export async function fetchSheet(
  sub_mess_id: string,
  year: number,
  month: number,
): Promise<SheetData | null> {
  await delay();
  const diff = monthDiff(year, month);
  if (diff < -3 || diff > 3) return null;

  const key = monthKey(year, month);
  const existing =
    _months.get(key) ?? seedCurrentMonth(sub_mess_id, year, month);
  if (existing) {
    existing.month.sub_mess_id = sub_mess_id;
    return snapshot(existing);
  }
  return null;
}

export async function createMonth(
  sub_mess_id: string,
  year: number,
  month: number,
  payload: MonthCreatePayload,
): Promise<SheetData> {
  await delay(300);
  if (monthDiff(year, month) < 0 || monthDiff(year, month) > 3)
    throw new Error("Cannot create a sheet for that month.");

  const phases = payload.phases.map((p, i) => ({
    ...p,
    id: `ph-${year}-${month}-${i}-${Date.now()}`,
  }));

  const sheet = buildSheet(
    sub_mess_id,
    year,
    month,
    payload.rate_type,
    phases,
    [],
    [],
    [],
  );
  _months.set(monthKey(year, month), sheet);
  _lastSettings = payload;
  return snapshot(sheet);
}

export async function updateMonthPhases(
  monthId: string,
  payload: MonthCreatePayload,
): Promise<SheetData> {
  await delay(250);
  const stored = getStoredMonthById(monthId);
  if (!stored) throw new Error("Month not found.");
  if (payload.phases.length === 0) {
    throw new Error("A sheet must keep at least one phase.");
  }

  const nextPhaseIds = new Set(payload.phases.map((phase) => phase.id));
  const transferMap = payload.phase_transfer_map ?? {};

  for (const entry of stored.entries) {
    const nextCounts: Record<string, number> = {};
    for (const [phaseId, count] of Object.entries(entry.counts)) {
      if (nextPhaseIds.has(phaseId)) {
        nextCounts[phaseId] = (nextCounts[phaseId] ?? 0) + count;
        continue;
      }

      const transferTo = transferMap[phaseId];
      if (transferTo && nextPhaseIds.has(transferTo)) {
        nextCounts[transferTo] = (nextCounts[transferTo] ?? 0) + count;
      }
    }
    entry.counts = nextCounts;
  }

  stored.month.rate_type = payload.rate_type;
  stored.month.phases = payload.phases.map((phase) => ({ ...phase }));

  _lastSettings = payload;
  return snapshot(stored);
}

export async function deleteMonth(monthId: string): Promise<void> {
  await delay(200);
  for (const [key, stored] of _months) {
    if (stored.month.id === monthId) {
      _months.delete(key);
      return;
    }
  }
}

export async function getPreviousSettings(): Promise<MonthCreatePayload | null> {
  await delay(100);
  return _lastSettings;
}

export async function upsertMealEntry(body: {
  meal_month_id: string;
  member_id: string;
  day_number: number;
  phase_id: string;
  count: number;
}) {
  await delay(150);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");

  const existing = stored.entries.find(
    (e) => e.member_id === body.member_id && e.day_number === body.day_number,
  );
  if (existing) {
    existing.counts = { ...existing.counts, [body.phase_id]: body.count };
  } else {
    stored.entries.push({
      member_id: body.member_id,
      day_number: body.day_number,
      counts: { [body.phase_id]: body.count },
    });
  }
  return { success: true };
}

export async function addShoppingEntry(body: {
  meal_month_id: string;
  entry_date: string;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");

  const day_number = dayNumberFromDate(body.entry_date);
  if (!day_number || day_number < 1) throw new Error("Invalid shopping date.");

  const entry: ShoppingEntry = {
    id: `sh-${Date.now()}`,
    day_number,
    entry_date: body.entry_date,
    amount: String(body.amount),
    note: body.note ?? null,
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  };
  stored.shopping.push(entry);
  return { success: true, data: entry };
}

export async function updateShoppingEntry(body: {
  id: string;
  meal_month_id: string;
  entry_date: string;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");

  const day_number = dayNumberFromDate(body.entry_date);
  if (!day_number || day_number < 1) throw new Error("Invalid shopping date.");

  const idx = stored.shopping.findIndex((s) => s.id === body.id);
  if (idx === -1) throw new Error("Shopping entry not found.");
  stored.shopping[idx] = {
    ...stored.shopping[idx],
    day_number,
    entry_date: body.entry_date,
    amount: String(body.amount),
    note: body.note ?? null,
  };
  return { success: true };
}

export async function deleteShoppingEntry(id: string) {
  await delay(150);
  for (const [, stored] of _months) {
    const before = stored.shopping.length;
    stored.shopping = stored.shopping.filter((s) => s.id !== id);
    if (stored.shopping.length !== before) break;
  }
  return { success: true };
}

export async function addDepositEntry(body: {
  meal_month_id: string;
  member_id: string;
  entry_date: string;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");

  const entry: DepositEntry = {
    id: `dep-${Date.now()}`,
    member_id: body.member_id,
    entry_date: body.entry_date,
    amount: String(body.amount),
    note: body.note ?? null,
    added_by: MEMBER_1,
    created_at: new Date().toISOString(),
  };
  stored.deposits.push(entry);
  return { success: true, data: entry };
}

export async function updateDepositEntry(body: {
  id: string;
  meal_month_id: string;
  member_id: string;
  entry_date: string;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");

  const idx = stored.deposits.findIndex((d) => d.id === body.id);
  if (idx === -1) throw new Error("Deposit not found.");
  stored.deposits[idx] = {
    ...stored.deposits[idx],
    member_id: body.member_id,
    entry_date: body.entry_date,
    amount: String(body.amount),
    note: body.note ?? null,
  };
  return { success: true };
}

export async function deleteDepositEntry(id: string) {
  await delay(150);
  for (const [, stored] of _months) {
    const before = stored.deposits.length;
    stored.deposits = stored.deposits.filter((d) => d.id !== id);
    if (stored.deposits.length !== before) break;
  }
  return { success: true };
}
