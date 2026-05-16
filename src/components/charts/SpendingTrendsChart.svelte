<script lang="ts">
  import dayjs from "../../lib/dayjs";
  import {
    chartTooltipFormatter,
    formatCurrency,
    roundCurrency,
  } from "../../lib/utils";
  import { TransactionType, type Transaction } from "../../types/Transaction";
  import Echart from "./Echart.svelte";

  const { transactions = [] }: { transactions: Transaction[] } = $props();

  const monthlyTransactions = $derived.by(() => {
    const transactionsMap = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type !== TransactionType.EXPENSE) {
          return acc;
        }

        const month = dayjs(transaction.date).format("YYYY-MM");

        if (!acc[month]) {
          acc[month] = 0;
        }

        acc[month] += Number(transaction.amount);

        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(transactionsMap).map(([month, amount]) => ({
      month,
      amount,
    }));
  });

  const options = $derived({
    width: "100%",
    title: {
      text: "Spending Trends",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      formatter: (params: any) => {
        if (!params.length) return "";

        return chartTooltipFormatter(
          dayjs(params[0].value.month, "YYYY-MM").format("MMM YYYY"),
          params[0].value.amount,
        );
      },
    },
    dataset: {
      source: monthlyTransactions,
    },
    xAxis: {
      type: "time",
    },
    yAxis: {
      axisLabel: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    dataZoom: [
      {
        type: "inside",
        // TODO: Consider using dynamic start/end based on amount of data
        start: 85,
        end: 100,
      },
    ],
    series: [
      { type: "line", smooth: true, encode: { x: "month", y: "amount" } },
    ],
  });
</script>

<Echart {options} />
