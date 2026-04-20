import type { TransactionSheetField } from "./Transaction";

export interface GoogleSheetConfig {
  expense: DataRange;
  income: DataRange;
  fields: TransactionSheetField[];
  sheetName: string;
  batchSize: number;
}

interface DataRange {
  startingRow: string;
  startingColumn: string;
  endingRow: string;
  endingColumn: string;
}
