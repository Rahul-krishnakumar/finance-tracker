import { JWT } from "google-auth-library";
import { drive_v3, google } from "googleapis";
import { googleSheetConfig } from "../config/googleSheet.config";
import type { Transaction } from "../types/Transaction";

const scopes = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

const client = new JWT({
  email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: import.meta.env.GOOGLE_PRIVATE_KEY,
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

export const getExpenseData = async () => {
  const files = (
    await drive.files.list({
      q: `'${import.meta.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet'`,
    })
  ).data.files;

  if (!files) {
    return { expenseData: [], incomeData: [] };
  }

  const filePromises = files.map((file) => () => extractSheetData(file.id));
  const results = await batchApiCalls(filePromises);

  const totalExpenseData = results
    .flatMap((result) => result.expenseData)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncomeData = results
    .flatMap((result) => result.incomeData)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    expenseData: totalExpenseData,
    incomeData: totalIncomeData,
  };
};

const batchApiCalls = async <T>(
  calls: (() => Promise<T>)[],
  batchSize: number = googleSheetConfig.batchSize,
): Promise<T[]> => {
  const results: T[][] = [];
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize);
    results.push(
      (await Promise.allSettled(batch.map((call) => call()))).map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        // TODO: Add proper logging for the application
        console.error("Error fetching data from Google Sheets:", result.reason);
        return { expenseData: [], incomeData: [] } as unknown as T;
      }),
    );

    // Add a delay between batches to respect the 60 requests/min rate limit
    if (i + batchSize < calls.length) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
  return results.flat();
};

const extractSheetData = async (spreadsheetId?: string | null) => {
  if (!spreadsheetId) {
    return { expenseData: [], incomeData: [] };
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
    const transaction = parseTransaction(row);
    incomeData.push(transaction);
  });

  expenseValues.forEach((row) => {
    const transaction = parseTransaction(row);
    expenseData.push(transaction);
  });

  return {
    expenseData,
    incomeData,
  };
};

const parseTransaction = (row: string[]) => {
  const transaction = {} as Transaction;
  row.forEach((cell, i) => {
    transaction[googleSheetConfig.headers[i] as keyof Transaction] = cell;
  });
  return transaction;
};
