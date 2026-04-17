export interface GoogleSheetConfig {
  expense: DataRange;
  income: DataRange;
  headers: string[];
  sheetName: string;
}

interface DataRange {
  startingRow: string;
  startingColumn: string;
  endingRow: string;
  endingColumn: string;
}
