import { readFile } from "node:fs/promises";
import path from "node:path";
import { Configuration, Transaction } from "./config";
import { db } from "astro:db";
import { asDrizzleTable } from "@astrojs/db/utils";
import type { Transaction as TransactionType } from "../src/types/Transaction";
import dayjs from "../src/lib/dayjs";
import { getEnv } from "../src/lib/utils";

const PREFETCH_PATH = path.join(
  process.cwd(),
  ".cache",
  "prefetch-transactions.json",
);

export default async function seed() {
  console.log("🌱 Seeding database from pre-fetched data...");

  let raw: string;
  try {
    raw = await readFile(PREFETCH_PATH, "utf-8");
  } catch {
    console.error(
      "❌ No pre-fetched data found. Run `bun run fetch-sheets` first.",
    );
    return;
  }

  // Read data pulled using the fetch-sheets script
  const transactionData: TransactionType[] = JSON.parse(raw);

  if (transactionData.length === 0) {
    console.log("⚠️  No transactions to seed.");
    return;
  }

  const TransactionTable = asDrizzleTable("Transaction", Transaction);
  const ConfigurationTable = asDrizzleTable("Configuration", Configuration);

  // We're deleting and re-inserting the data since google sheet data has no unique
  // id, meaning there is no way to differenciate between old and new data
  // TODO: Implement a better solution since this is only feasible for small datasets
  const validTransactions = transactionData
    .map((transaction, index) => {
      const transactionDate = dayjs(transaction.date);
      const amount = parseFloat(
        String(transaction.amount).replace(/[₹,]/g, "").trim(),
      );

      if (!transactionDate.isValid() || isNaN(amount)) {
        console.error(
          `⚠️  Skipping row ${index} due to bad data:`,
          transaction,
        );
        return null;
      }

      return {
        id: crypto.randomUUID(),
        date: transactionDate.toDate(),
        amount,
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  if (validTransactions.length === 0) {
    console.log("⚠️  No valid transactions to seed.");
    return;
  }

  await db.batch([
    db.delete(TransactionTable),
    db.insert(TransactionTable).values(validTransactions),
  ]);

  /**
   * This is to maintain the initial opening balance of the account at
   * the point in time when data started getting tracked in sheets.
   * Without this value, we will not be able to calculate the correct
   * account balance.
   */
  await db.insert(ConfigurationTable).values({
    key: "opening-balance",
    value: getEnv("OPENING_BALANCE", "0.00"),
  });

  console.log(
    `✅ Seeded ${validTransactions.length} transactions. (${transactionData.length - validTransactions.length} skipped)`,
  );
}
