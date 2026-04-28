import { column, defineDb, defineTable } from "astro:db";

export const Transaction = defineTable({
  columns: {
    id: column.text({ primaryKey: true }), // uuid
    date: column.date(),
    amount: column.number(),
    description: column.text(),
    category: column.text(),
    type: column.text(), // 'income' | 'expense'
  },
});

export const Configuration = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    value: column.text(),
  },
});

export default defineDb({
  tables: { Transaction, Configuration },
});
