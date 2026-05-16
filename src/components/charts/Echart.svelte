<script lang="ts">
  import { BarChart, LineChart, PieChart } from "echarts/charts";
  import {
    DatasetComponent,
    DataZoomComponent,
    GridComponent,
    TitleComponent,
    TooltipComponent,
  } from "echarts/components";
  import {
    init,
    registerTheme,
    use,
    type ECharts,
    type EChartsCoreOption,
  } from "echarts/core";
  import { CanvasRenderer } from "echarts/renderers";
  import { onDestroy, onMount } from "svelte";

  const charts = [BarChart, LineChart, PieChart];

  const echartComponents = [
    GridComponent,
    DatasetComponent,
    TooltipComponent,
    TitleComponent,
    DataZoomComponent,
  ];

  use([...charts, ...echartComponents, CanvasRenderer]);

  const { options }: { options: EChartsCoreOption } = $props();
  const chartOptions = $derived({
    width: "600px",
    height: "400px",
    ...options,
  });

  let echartContainer: HTMLElement;
  let echart: ECharts;

  function createTheme() {
    const styles = getComputedStyle(document.documentElement);
    const getCssVariables = (name: string) =>
      styles.getPropertyValue(name).trim();

    return {
      // Styles for chart title
      title: {
        textStyle: {
          color: getCssVariables("--pico-color"),
          fontFamily: getCssVariables("--pico-font-family"),
          fontSize: 24,
        },
        top: 0,
        left: 0,
      },
      // Global font and text colors
      textStyle: {
        fontFamily: getCssVariables("--pico-font-family"),
        color: getCssVariables("--pico-color"),
      },
      // Default series color (the color of your bars/lines)
      color: [
        getCssVariables("--pico-primary"),
        getCssVariables("--pico-primary-hover"),
        getCssVariables("--pico-primary-focus"),
      ],
      // X-Axis styling
      categoryAxis: {
        axisLine: {
          lineStyle: { color: getCssVariables("--pico-muted-border-color") },
        },
        axisTick: {
          lineStyle: { color: getCssVariables("--pico-muted-border-color") },
        },
        axisLabel: { color: getCssVariables("--pico-muted-color") },
      },
      // Y-Axis styling
      valueAxis: {
        axisLine: {
          lineStyle: { color: getCssVariables("--pico-muted-border-color") },
        },
        splitLine: {
          lineStyle: { color: getCssVariables("--pico-muted-border-color") },
        },
        axisLabel: { color: getCssVariables("--pico-muted-color") },
      },
      tooltip: {
        backgroundColor: getCssVariables("--pico-background-color"),
        textStyle: { color: getCssVariables("--pico-color") },
        borderRadius: 8,
        borderWidth: 0,
        extraCssText: `
          border-left: 0.25rem solid ${getCssVariables("--pico-primary")};
          padding: 0.5rem 1rem;
          border-radius: 0 0.25rem 0.25rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `,
      },
    };
  }

  onMount(() => {
    const picoTheme = createTheme();

    registerTheme("pico", picoTheme);

    echart = init(echartContainer, "pico");

    // Resize the chart in case the window is resized
    const resizeHandler = () => echart.resize();
    window.addEventListener("resize", resizeHandler);

    return () => window.removeEventListener("resize", resizeHandler);
  });

  $effect(() => {
    echart?.setOption(chartOptions);
  });

  onDestroy(() => {
    echart?.dispose();
  });
</script>

<article
  bind:this={echartContainer}
  class="echart-container"
  style="width: {chartOptions.width}; height: {chartOptions.height};"
></article>
