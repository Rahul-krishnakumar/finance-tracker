<script lang="ts">
  import { TransactionType, type Transaction } from "../types/Transaction";
  import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
  } from "@lucide/svelte";

  const { transactions }: { transactions: Transaction[] } = $props();
  const PAGE_SIZE = 15;

  const totalPages = $derived(Math.ceil(transactions.length / PAGE_SIZE));
  let currentPage = $state(1);
  let startIndex = $derived((currentPage - 1) * PAGE_SIZE);
  let endIndex = $derived(startIndex + PAGE_SIZE);

  const paginatedTransactions = $derived(
    transactions.slice(startIndex, endIndex),
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
</script>

<!-- TODO: Integrate tanstack/table for better pagination and sorting -->
<table class="striped">
  <thead>
    <tr>
      <th>Date</th>
      <th>Description</th>
      <th>Category</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {#each paginatedTransactions as transaction}
      <tr>
        <td>{transaction.date}</td>
        <td>{transaction.description}</td>
        <td>{transaction.category}</td>
        <td class="transaction-amount">
          {#if transaction.type === TransactionType.EXPENSE}
            <span class="expense"><ArrowDown size={16} /></span>
          {:else}
            <span class="income"><ArrowUp size={16} /></span>
          {/if}
          <span>{transaction.amount}</span></td
        >
      </tr>
    {/each}
  </tbody>
</table>

<!-- TODO: Implement with a proper pagination UI -->
<div class="pagination">
  <div class="page-info">Page {currentPage} of {totalPages}</div>
  <div class="page-buttons">
    <button onclick={() => goToPage(currentPage - 1)}>
      <ChevronLeft size={16} />
    </button>
    <button onclick={() => goToPage(currentPage + 1)}>
      <ChevronRight size={16} />
    </button>
  </div>
</div>

<style>
  .transaction-amount {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .expense {
    color: var(--pico-color-red-500);
  }
  .income {
    color: var(--pico-color-green-500);
  }
</style>
