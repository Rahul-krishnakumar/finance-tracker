import type { GoogleSheetConfig } from "../types/GoogleSheetConfig";

export const googleSheetConfig: GoogleSheetConfig = {
  expense: {
    startingRow: "5",
    startingColumn: "B",
    endingRow: "",
    endingColumn: "E",
  },
  income: {
    startingRow: "5",
    startingColumn: "G",
    endingRow: "",
    endingColumn: "J",
  },
  fields: ["date", "amount", "description", "category"],
  sheetName: "Transactions",
  batchSize: 5,
};
