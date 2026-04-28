import crypto from "node:crypto";
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { googleSheetConfig } from "../config/googleSheet.config";
import { TransactionType, type Transaction } from "../types/Transaction";
import { getEnv } from "./utils";
import dayjs from "./dayjs";

const scopes = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

const client = new JWT({
  email: getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
  key: getEnv("GOOGLE_PRIVATE_KEY"),
  scopes,
});

const drive = google.drive({
  version: "v3",
  auth: client,
});

const sheets = google.sheets({
  version: "v4",
  auth: client,
});

export async function getTransactionData(): Promise<Transaction[]> {
  const files = (
    await drive.files.list({
      q: `'${getEnv("GOOGLE_DRIVE_FOLDER_ID")}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet'`,
    })
  ).data.files;

  if (!files) {
    return [];
  }

  const filePromises = files.map((file) => () => extractSheetData(file.id));
  const results = await batchApiCalls(filePromises);

  return results.flat().sort((a, b) => {
    return dayjs(b.date).diff(dayjs(a.date));
  });
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimited =
        error?.code === 429 ||
        error?.response?.status === 429 ||
        error?.message?.includes("Quota exceeded");

      if (!isRateLimited || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 10s, 20s, 40s
      // TODO: explore replacing this with ky or some other library
      const backoff = 10000 * Math.pow(2, attempt);
      console.warn(
        `Rate limited, retrying in ${backoff / 1000}s (attempt ${attempt + 1}/${maxRetries})...`,
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw new Error("Unreachable");
}

async function batchApiCalls<T>(
  calls: (() => Promise<T>)[],
  batchSize: number = googleSheetConfig.batchSize,
): Promise<T[]> {
  const results: T[][] = [];
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize);
    results.push(
      (await Promise.allSettled(batch.map((call) => withRetry(call)))).map(
        (result) => {
          if (result.status === "fulfilled") {
            return result.value;
          }
          // TODO: Add proper logging for the application
          console.error(
            "Error fetching data from Google Sheets:",
            result.reason,
          );
          return [] as T;
        },
      ),
    );

    // Delay between batches to respect the 60 read requests/min rate limit.
    // With batchSize=5, we need at least 5s between batches (5 reqs / 1 req-per-sec).
    // Using 6s for safety margin.
    if (i + batchSize < calls.length) {
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }
  }
  return results.flat();
}

async function extractSheetData(spreadsheetId?: string | null) {
  if (!spreadsheetId) {
    return [];
  }

  const expenseRange = `${googleSheetConfig.sheetName}!${googleSheetConfig.expense.startingColumn}${googleSheetConfig.expense.startingRow}:${googleSheetConfig.expense.endingColumn}${googleSheetConfig.expense.endingRow}`;
  const incomeRange = `${googleSheetConfig.sheetName}!${googleSheetConfig.income.startingColumn}${googleSheetConfig.income.startingRow}:${googleSheetConfig.income.endingColumn}${googleSheetConfig.income.endingRow}`;

  const expenseData = [] as Transaction[];
  const incomeData = [] as Transaction[];

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [expenseRange, incomeRange],
  });

  const expenseValues = response.data.valueRanges?.[0].values || [];
  const incomeValues = response.data.valueRanges?.[1].values || [];

  incomeValues.forEach((row) => {
    const transaction = parseTransaction(row, TransactionType.INCOME);
    incomeData.push(transaction);
  });

  expenseValues.forEach((row) => {
    const transaction = parseTransaction(row, TransactionType.EXPENSE);
    expenseData.push(transaction);
  });

  return incomeData.concat(expenseData);
}

const parseTransaction = (
  row: string[],
  transactionType: TransactionType,
): Transaction => {
  const transaction: Partial<Transaction> = {
    id: crypto.randomUUID(),
    type: transactionType,
  };

  row.forEach((cell, i) => {
    const field = googleSheetConfig.fields[i];
    if (field) {
      transaction[field] = cell;
    }
  });

  return transaction as Transaction;
};
