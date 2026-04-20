export interface Transaction {
  id: string;
  date: string;
  amount: string;
  description: string;
  category: string;
  type: TransactionType;
}

export type TransactionSheetField = keyof Omit<Transaction, "id" | "type">;

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}
