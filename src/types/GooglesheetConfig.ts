export interface GoogleSheetConfig {
  expense: DataRange;
  income: DataRange;
  headers: string[];
  sheetName: string;
  batchSize: number;
}

interface DataRange {
  startingRow: string;
  startingColumn: string;
  endingRow: string;
  endingColumn: string;
}
