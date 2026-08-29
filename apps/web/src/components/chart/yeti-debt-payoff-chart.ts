import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ChartData, ChartOptions } from "chart.js";
import type { Debt, TimelineMonth } from "../../calculator";
import { CHART_PALETTE, getMinimalChartOptions, getThemeTokens } from "./chartTheme";
import "./yeti-chart";

/**
 * Payoff balance chart comparing accelerated debt snowball (stacked areas)
 * against baseline minimum payments only (dashed line).
 */
@customElement("yeti-debt-payoff-chart")
export class YetiDebtPayoffChart extends LitElement {
  @property({ attribute: false })
  debts: Debt[] = [];

  @property({ attribute: false })
  timeline: TimelineMonth[] = [];

  @property({ attribute: false })
  baselineTimeline?: TimelineMonth[] = [];

  static styles = css`
    :host {
      display: block;
      width: 100%;
      background: var(--bg, #ffffff);
      border: 1px solid var(--border, #e5e4e7);
      border-radius: 16px;
      padding: 24px;
      box-shadow: var(--shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.05));
      box-sizing: border-box;
      margin-bottom: 24px;
    }

    .chart-header {
      margin-bottom: 20px;
    }

    .title-group h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: var(--text-h, #08060d);
    }

    .title-group p {
      font-size: 13px;
      color: var(--text, #6b6375);
      margin: 0;
    }

    .chart-wrapper {
      position: relative;
      width: 100%;
      height: 320px;
    }

    /* Custom Minimal Legend */
    .legend-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border, #e5e4e7);
      justify-content: center;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text, #6b6375);
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }

    .legend-line-dashed {
      width: 18px;
      height: 0;
      border-top: 2px dashed var(--text, #6b6375);
      display: inline-block;
      flex-shrink: 0;
    }

    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: var(--text, #6b6375);
      font-size: 14px;
    }
  `;

  private buildChartData(): ChartData {
    if (!this.timeline || this.timeline.length === 0) {
      return { labels: [], datasets: [] };
    }

    const tokens = getThemeTokens();
    const hasBaseline = this.baselineTimeline && this.baselineTimeline.length > 0;
    const maxLength = Math.max(
      this.timeline.length,
      hasBaseline ? this.baselineTimeline!.length : 0,
    );

    const sourceTimeline =
      hasBaseline && this.baselineTimeline!.length >= this.timeline.length
        ? this.baselineTimeline!
        : this.timeline;

    const labels = Array.from({ length: maxLength }, (_, i) => {
      if (i < sourceTimeline.length) {
        const m = sourceTimeline[i];
        return m.monthIndex === 0 ? "Start" : `${m.monthName} '${String(m.year).slice(-2)}`;
      }
      return `M${i}`;
    });

    // 1. Stacked debt area datasets
    const datasets: any[] = this.debts.map((debt, idx) => {
      const palette = CHART_PALETTE[idx % CHART_PALETTE.length];
      const data = Array.from({ length: maxLength }, (_, i) => {
        if (i < this.timeline.length) {
          const val = this.timeline[i].debtBalances
            ? this.timeline[i].debtBalances[debt.id]
            : 0;
          return val !== undefined ? val : 0;
        }
        return 0;
      });

      return {
        label: debt.name,
        data,
        borderColor: palette.border,
        backgroundColor: palette.bg,
        fill: true,
        stack: "debts",
        tension: 0.35,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 5,
      };
    });

    // 2. Minimum Payment Only baseline overlay curve
    if (hasBaseline) {
      const baselineData = Array.from({ length: maxLength }, (_, i) => {
        if (i < this.baselineTimeline!.length) {
          return parseFloat(this.baselineTimeline![i].totalRemainingBalance);
        }
        return 0;
      });

      datasets.push({
        label: "Minimum Payments Only",
        data: baselineData,
        borderColor: tokens.textColor,
        backgroundColor: "transparent",
        borderDash: [6, 4],
        fill: false,
        stack: "baseline", // Kept in its own stack so it tracks total unstacked remaining balance
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: tokens.textColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      });
    }

    return { labels, datasets };
  }

  private buildChartOptions(): ChartOptions {
    return getMinimalChartOptions({
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    });
  }

  render() {
    if (this.debts.length === 0 || this.timeline.length === 0) {
      return html`
        <div class="empty-state">Add your debts to see the payoff balance curve.</div>
      `;
    }

    const chartData = this.buildChartData();
    const chartOptions = this.buildChartOptions();
    const hasBaseline = this.baselineTimeline && this.baselineTimeline.length > 0;

    return html`
      <div class="chart-header">
        <div class="title-group">
          <h2>Debt Balance Payoff Curve</h2>
          <p>Stacked debt payoff compared to minimum payments only</p>
        </div>
      </div>

      <div class="chart-wrapper">
        <yeti-chart type="line" .data="${chartData}" .options="${chartOptions}"></yeti-chart>
      </div>

      <div class="legend-container">
        ${this.debts.map((debt, idx) => {
          const palette = CHART_PALETTE[idx % CHART_PALETTE.length];
          return html`
            <div class="legend-item">
              <span class="legend-dot" style="background: ${palette.main}"></span>
              <span>${debt.name}</span>
            </div>
          `;
        })}
        ${hasBaseline
          ? html`
              <div class="legend-item">
                <span class="legend-line-dashed"></span>
                <span>Minimum Payments Only</span>
              </div>
            `
          : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yeti-debt-payoff-chart": YetiDebtPayoffChart;
  }
}
