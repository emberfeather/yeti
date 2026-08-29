import {
  Chart,
  registerables,
  type ChartOptions,
} from "chart.js";

// Register all standard Chart.js controllers, scales, elements, and plugins
Chart.register(...registerables);

/**
 * Modern harmonic palette designed to look sleek in both light and dark modes.
 */
export const CHART_PALETTE = [
  { main: "#aa3bff", bg: "rgba(170, 59, 255, 0.15)", border: "rgba(170, 59, 255, 0.8)" }, // Purple / Brand Accent
  { main: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.8)" },   // Cyan
  { main: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.8)" },  // Emerald
  { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.8)" },  // Amber
  { main: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.8)" },  // Pink
  { main: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.8)" },  // Indigo
  { main: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.8)" },  // Blue
];

/**
 * Retrieves current theme colors from DOM CSS variables.
 */
export function getThemeTokens() {
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return {
    textColor: isDark ? "#9ca3af" : "#6b6375",
    textHeadingColor: isDark ? "#f3f4f6" : "#08060d",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
    tooltipBg: isDark ? "rgba(22, 23, 29, 0.92)" : "rgba(255, 255, 255, 0.95)",
    tooltipBorder: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
    accentColor: isDark ? "#c084fc" : "#aa3bff",
    accentBg: isDark ? "rgba(192, 132, 252, 0.15)" : "rgba(170, 59, 255, 0.12)",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };
}

/**
 * Generates a minimal, modern Chart.js options preset.
 */
export function getMinimalChartOptions(overrides: ChartOptions<any> = {}): ChartOptions<any> {
  const tokens = getThemeTokens();

  const baseOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 16,
        bottom: 8,
        left: 8,
        right: 16,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    animation: {
      duration: 750,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        display: false, // Default to false; custom pill legends can be rendered in HTML
      },
      tooltip: {
        enabled: true,
        backgroundColor: tokens.tooltipBg,
        titleColor: tokens.textHeadingColor,
        bodyColor: tokens.textColor,
        borderColor: tokens.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: tokens.fontFamily,
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          family: tokens.fontFamily,
          size: 12,
          weight: "normal",
        },
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const val = context.parsed.y;
            if (val !== null && val !== undefined) {
              return ` ${label}: $${val.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            }
            return ` ${label}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: tokens.textColor,
          font: {
            family: tokens.fontFamily,
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: tokens.gridColor,
        },
        ticks: {
          color: tokens.textColor,
          font: {
            family: tokens.fontFamily,
            size: 11,
          },
          maxTicksLimit: 6,
          callback: function (value: string | number) {
            const num = Number(value);
            if (num >= 1000) {
              return `$${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
            }
            return `$${num}`;
          },
        },
      },
    },
  };

  return {
    ...baseOptions,
    ...overrides,
    plugins: {
      ...baseOptions.plugins,
      ...overrides.plugins,
    },
    scales: {
      ...baseOptions.scales,
      ...overrides.scales,
    },
  };
}

/**
 * Creates a soft vertical linear gradient on the canvas context for modern area fills.
 */
export function createAreaGradient(
  ctx: CanvasRenderingContext2D,
  colorRgb: string,
  height: number = 300,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${colorRgb.replace(")", ", 0.28)").replace("rgb", "rgba")}`);
  gradient.addColorStop(1, `${colorRgb.replace(")", ", 0.00)").replace("rgb", "rgba")}`);
  return gradient;
}
