import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import {
  Chart,
  type ChartConfiguration,
  type ChartData,
  type ChartOptions,
  type ChartType,
  type Plugin,
} from "chart.js";
import "./chartTheme";

/**
 * Reusable Lit Web Component wrapper for Chart.js.
 * Provides clean lifecycle management, reactive updates, and responsive auto-resizing.
 */
@customElement("yeti-chart")
export class YetiChart extends LitElement {
  @property({ type: String })
  type: ChartType = "line";

  @property({ attribute: false })
  data: ChartData = { labels: [], datasets: [] };

  @property({ attribute: false })
  options?: ChartOptions;

  @property({ attribute: false })
  plugins?: Plugin[];

  @query("canvas")
  private canvas?: HTMLCanvasElement;

  private chart?: Chart;
  private resizeObserver?: ResizeObserver;
  private darkModeMediaQuery?: MediaQueryList;
  private themeChangeHandler = () => this.handleThemeChange();

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .chart-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (typeof window !== "undefined" && window.matchMedia) {
      this.darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.darkModeMediaQuery.addEventListener("change", this.themeChangeHandler);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.darkModeMediaQuery) {
      this.darkModeMediaQuery.removeEventListener("change", this.themeChangeHandler);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.destroyChart();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.initChart();

    if (window.ResizeObserver && this.renderRoot) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });
      const container = this.renderRoot.querySelector(".chart-container");
      if (container) {
        this.resizeObserver.observe(container);
      }
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("type")) {
      this.initChart();
    } else if (changedProperties.has("data") || changedProperties.has("options")) {
      this.updateChart();
    }
  }

  private handleThemeChange() {
    if (this.chart) {
      // Trigger a re-render so dynamic theme colors refresh
      this.dispatchEvent(new CustomEvent("theme-change", { bubbles: true, composed: true }));
      this.chart.update();
    }
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private initChart() {
    if (!this.canvas) return;

    this.destroyChart();

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: this.options,
      plugins: this.plugins,
    };

    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      this.chart = new Chart(ctx, config);
    }
  }

  private updateChart() {
    if (!this.chart) {
      this.initChart();
      return;
    }

    this.chart.data = this.data;
    if (this.options) {
      this.chart.options = this.options;
    }
    this.chart.update("none"); // Smooth direct update
  }

  /**
   * Expose getChartInstance for advanced direct manipulation if needed.
   */
  public getChartInstance(): Chart | undefined {
    return this.chart;
  }

  render() {
    return html`
      <div class="chart-container">
        <canvas></canvas>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yeti-chart": YetiChart;
  }
}
