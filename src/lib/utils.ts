import dayjs from "./dayjs";

/** Reads env vars from Vite's import.meta.env or falls back to process.env (for Bun) */
export function getEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env?.[key] ?? (typeof process !== "undefined" ? process.env[key] : undefined);

  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable "${key}" is not defined.`);
  }

  return value;
}

export function formatDate(date: string, format: string = "DD/MM/YYYY") {
  return dayjs(date).format(format);
}

export function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = "INR") {
  return roundCurrency(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: currency,
  });
}

export function chartTooltipFormatter(header: string, value: number | string) {
  const formattedValue = typeof value === "number" ? formatCurrency(value) : value;
  return `
    <hgroup style="margin: 0;">
      <h6>${header}</h6>
      <small style="font-size: 0.75rem;">${formattedValue}</small>
    </hgroup>
  `;
}
