export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
}

export type TransactionSheetField =
  | "date"
  | "amount"
  | "description"
  | "category";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}
