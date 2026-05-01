<script lang="ts">
  import { roundCurrency, chartTooltipFormatter } from "../../lib/utils";
  import { TransactionType, type Transaction } from "../../types/Transaction";
  import Echart from "./Echart.svelte";

  const { transactions = [] }: { transactions: Transaction[] } = $props();

  const categoryTransactions = $derived.by(() => {
    const expenses = transactions.filter(
      (transaction) => transaction.type === TransactionType.EXPENSE,
    );

    const categoryMap: Map<string, number> = new Map();

    expenses.forEach((transaction) => {
      const currentAmount = categoryMap.get(transaction.category) || 0;
      categoryMap.set(
        transaction.category,
        currentAmount + Number(transaction.amount),
      );
    });

    return Array.from(categoryMap, ([category, amount]) => ({
      category,
      amount,
    })).sort((a, b) => a.amount - b.amount);
  });

  const options = $derived({
    title: {
      text: "Expenses by Category",
    },
    tooltip: {
      trigger: "item",
      axisPointer: { type: "none" },
      formatter: (params: any) => chartTooltipFormatter(params.value.category, params.value.amount),
    },
    dataset: {
      source: categoryTransactions,
    },
    xAxis: {},
    yAxis: { type: "category" },
    series: [{ type: "bar", encode: { x: "amount", y: "category" } }],
  });
</script>

<Echart {options} />
