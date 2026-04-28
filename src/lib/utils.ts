import dayjs from "./dayjs";

/** Reads env vars from Vite's import.meta.env or falls back to process.env (for Bun) */
export function getEnv(key: string): string {
  return (import.meta.env?.[key] ?? process.env[key]) || "";
}

export function formatDate(date: string, format: string = "DD/MM/YYYY") {
  return dayjs(date).format(format);
}

export function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
