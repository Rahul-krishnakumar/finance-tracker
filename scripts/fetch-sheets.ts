/**
 * Pre-fetch script: Fetches transaction data from Google Sheets and writes
 * it to a local JSON file. This runs outside of Vite (via Bun) to avoid
 * Vite's 60-second module runner transport timeout.
 *
 * Usage: bun run scripts/fetch-sheets.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getTransactionData } from "../src/lib/googleSheets";

const PREFETCH_PATH = path.join(
  import.meta.dirname,
  "..",
  ".cache",
  "prefetch-transactions.json",
);

async function main() {
  console.log("📥 Fetching transaction data from Google Sheets...");

  const transactions = await getTransactionData();

  await mkdir(path.dirname(PREFETCH_PATH), { recursive: true });
  await writeFile(PREFETCH_PATH, JSON.stringify(transactions, null, 2));

  console.log(
    `✅ Fetched ${transactions.length} transactions → .cache/prefetch-transactions.json`,
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
