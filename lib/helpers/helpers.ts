export const fmt = (v: string | number | null | undefined): string =>
  v && v != null ? `Tk ${Number(v).toLocaleString()}` : "–";
