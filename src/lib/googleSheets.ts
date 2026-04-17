import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { googleSheetConfig } from "../config/googleSheet.config";
import type { Transaction } from "../types/Transaction";

export const getExpenseData = async () => {
  const spreadsheetId = import.meta.env.SHEET_ID;
  const expenseRange = `${googleSheetConfig.sheetName}!${googleSheetConfig.expense.startingColumn}${googleSheetConfig.expense.startingRow}:${googleSheetConfig.expense.endingColumn}${googleSheetConfig.expense.endingRow}`;
  const incomeRange = `${googleSheetConfig.sheetName}!${googleSheetConfig.income.startingColumn}${googleSheetConfig.income.startingRow}:${googleSheetConfig.income.endingColumn}${googleSheetConfig.income.endingRow}`;

  const expenseData = [] as Transaction[];
  const incomeData = [] as Transaction[];

  const client = new JWT({
    email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: import.meta.env.GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const expenseResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: expenseRange,
  });

  const incomeResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: incomeRange,
  });

  incomeResponse.data.values?.forEach((row) => {
    const transaction = parseTransaction(row);
    incomeData.push(transaction);
  });

  expenseResponse.data.values?.forEach((row) => {
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
