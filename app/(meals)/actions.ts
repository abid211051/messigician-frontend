import type {
  SheetData,
  MealEntry,
  ShoppingEntry,
  DepositEntry,
  MealPhase,
  MonthCreatePayload,
} from "./types";

const MEMBER_1 = "bbbbbbbb-0000-0000-0000-000000000001";
const MEMBER_2 = "bbbbbbbb-0000-0000-0000-000000000002";
const MEMBER_3 = "bbbbbbbb-0000-0000-0000-000000000003";

const MEMBERS = [
  { id: MEMBER_1, name: "Abed Afnan" },
  { id: MEMBER_2, name: "Rafi Islam" },
  { id: MEMBER_3, name: "Karim Hossain" },
];

let _lastSettings: MonthCreatePayload | null = null;

const DEFAULT_PHASES: MealPhase[] = [
  {
    id: "ph-lunch",
    name: "Lunch",
    rate_type: "dynamic",
    rate: 0,
    edit_start: "07:00",
    edit_end: "11:00",
  },
  {
    id: "ph-dinner",
    name: "Dinner",
    rate_type: "dynamic",
    rate: 0,
    edit_start: "18:00",
    edit_end: "22:00",
  },
];

// Seed entries use real phase IDs (not "total")
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

type StoredMonth = SheetData;
const _months = new Map<string, StoredMonth>();

// ── Helpers ────────────────────────────────────────────────────────────────
function delay(ms = 300) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
function monthKey(y: number, m: number) {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function monthId(y: number, m: number) {
  return `month-${y}-${String(m).padStart(2, "0")}`;
}

function monthDiff(year: number, month: number) {
  const now = new Date();
  return (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
}

function getStoredMonthById(id: string) {
  for (const [, s] of _months) if (s.month.id === id) return s;
  return null;
}

// ── Core calculation — per-phase rate type ─────────────────────────────────
function calcSummary(
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

  // Blended per-meal cost — used by dynamic phases
  const perMealCost =
    totalMeals > 0 ? +(totalShopping / totalMeals).toFixed(4) : 0;

  const memberSummary = MEMBERS.map((m) => {
    let myMeals = 0;
    let myCost = 0;

    for (const e of entries.filter((e) => e.member_id === m.id)) {
      for (const [phaseId, count] of Object.entries(e.counts)) {
        myMeals += count;
        const phase = phases.find((p) => p.id === phaseId);
        myCost +=
          phase?.rate_type === "fixed"
            ? count * phase.rate
            : count * perMealCost;
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
  phases: MealPhase[],
  entries: MealEntry[],
  shopping: ShoppingEntry[],
  deposits: DepositEntry[],
  status: "active" | "closed" = "active",
): StoredMonth {
  const { total_meals, total_shopping, per_meal_cost, member_summary } =
    calcSummary(phases, entries, shopping, deposits);
  return {
    month: {
      id: monthId(year, month),
      sub_mess_id,
      year,
      month,
      status,
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
  return existing ? snapshot(existing) : null;
}

export async function createMonth(
  sub_mess_id: string,
  year: number,
  month: number,
  payload: MonthCreatePayload,
): Promise<SheetData> {
  await delay(300);
  const diff = monthDiff(year, month);
  if (diff < 0 || diff > 3)
    throw new Error("Cannot create a sheet for that month.");

  const phases = payload.phases.map((p, i) => ({
    ...p,
    id: `ph-${year}-${month}-${i}-${Date.now()}`,
  }));

  const sheet = buildSheet(sub_mess_id, year, month, phases, [], [], []);
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

  const oldPhases = stored.month.phases;

  // Preserve existing phase IDs where name matches (keeps entries intact)
  stored.month.phases = payload.phases.map((p, i) => {
    const existing = oldPhases.find((op) => op.name === p.name);
    return { ...p, id: existing?.id ?? `ph-${Date.now()}-${i}` };
  });

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
  const e = stored.entries.find(
    (e) => e.member_id === body.member_id && e.day_number === body.day_number,
  );
  if (e) {
    e.counts = { ...e.counts, [body.phase_id]: body.count };
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
  day_number: number;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");
  const entry: ShoppingEntry = {
    id: `sh-${Date.now()}`,
    day_number: body.day_number,
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
  day_number: number;
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");
  const idx = stored.shopping.findIndex((s) => s.id === body.id);
  if (idx === -1) throw new Error("Entry not found.");
  stored.shopping[idx] = {
    ...stored.shopping[idx],
    day_number: body.day_number,
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
  amount: number;
  note?: string;
}) {
  await delay(200);
  const stored = getStoredMonthById(body.meal_month_id);
  if (!stored) throw new Error("Month not found.");
  const entry: DepositEntry = {
    id: `dep-${Date.now()}`,
    member_id: body.member_id,
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
