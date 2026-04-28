<script lang="ts">
  import { BarChart, LineChart, PieChart } from "echarts/charts";
  import {
    init,
    use,
    type ECharts,
    type EChartsCoreOption,
  } from "echarts/core";
  import { CanvasRenderer } from "echarts/renderers";
  import { onDestroy, onMount } from "svelte";

  use([BarChart, LineChart, PieChart, CanvasRenderer]);

  const { options }: { options: EChartsCoreOption } = $props();
  const chartOptions = $derived({
    width: "600px",
    height: "400px",
    ...options,
  });

  let echartContainer: HTMLDivElement;
  let echart: ECharts;

  onMount(() => {
    echart = init(echartContainer);
    echart.setOption(chartOptions);

    // Resize the chart in case the window is resized
    const resizeHandler = () => echart.resize();
    window.addEventListener("resize", resizeHandler);

    return () => window.removeEventListener("resize", resizeHandler);
  });

  onDestroy(() => {
    echart.dispose();
  });
</script>

<div
  bind:this={echartContainer}
  class="echart-container"
  style="width: {chartOptions.width}; height: {chartOptions.height};"
></div>
