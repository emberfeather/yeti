import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { localizationContext } from "@littoral/literally/localization/context";
import type { Localization } from "@littoral/literally/localization/localization";
import {
  calculateMinimumOnly,
  calculateSchedule,
  compareAllStrategies,
  STRATEGY_DEFINITIONS,
  type Debt,
  type StrategyKey,
} from "./calculator";
import { CHART_PALETTE } from "./components/chart/chartTheme";
import "./components/chart/yeti-debt-payoff-chart";

const INITIAL_DEBTS: Debt[] = [
  {
    id: "1",
    name: "Credit Card A",
    balance: 5000,
    interestRate: 18.9,
    minimumPayment: 150,
  },
  {
    id: "2",
    name: "Student Loan",
    balance: 15000,
    interestRate: 4.5,
    minimumPayment: 200,
  },
  {
    id: "3",
    name: "Car Loan",
    balance: 8000,
    interestRate: 6.0,
    minimumPayment: 250,
  },
];

@customElement("yeti-app-ai")
export class YetiAppAi extends LitElement {
  @consume({ context: localizationContext, subscribe: true })
  @state()
  private localization?: Localization;

  @state() private debts: Debt[] = INITIAL_DEBTS;
  @state() private extraPayment: number = 300;
  @state() private currentStrategyKey: StrategyKey = "lowestBalance";

  // Toggle states
  @state() private isAddingDebt: boolean = false;
  @state() private isComparingStrategies: boolean = false;
  @state() private showFullSchedule: boolean = false;

  // Form states for adding a new debt
  @state() private newName: string = "";
  @state() private newBalance: string = "";
  @state() private newRate: string = "";
  @state() private newMinPay: string = "";
  @state() private formError: string = "";

  static styles = [
    css`
      /* Modern Glassmorphic Full-Width Layout */
      .app-container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 24px;
        box-sizing: border-box;
        text-align: left;
      }

      .app-header {
        margin-bottom: 28px;
        text-align: center;
      }

      .app-header h1 {
        font-size: 38px;
        font-weight: 800;
        line-height: 1.1;
        margin: 0;
        letter-spacing: -1.2px;
        background: linear-gradient(135deg, var(--text-h), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .locale-switcher {
        display: inline-flex;
        align-items: center;
        background: rgba(244, 243, 236, 0.4);
        border: 1px solid var(--border);
        border-radius: 100px;
        padding: 2px;
        margin-top: 12px;
        gap: 2px;
      }

      .locale-btn {
        background: transparent;
        border: none;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 700;
        color: var(--text);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }

      .locale-btn.active {
        background: var(--accent);
        color: #ffffff;
      }

      .locale-btn:hover:not(.active) {
        color: var(--text-h);
        background: rgba(0, 0, 0, 0.05);
      }

      /* Card Styles */
      .card {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow);
        margin-bottom: 24px;
      }

      .card:last-child {
        margin-bottom: 0;
      }

      .card h2 {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        color: var(--text-h);
      }

      /* 2-Column Controls Row: Budget + Strategy */
      .controls-grid {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (max-width: 860px) {
        .controls-grid {
          grid-template-columns: 1fr;
        }
      }

      /* 2-Column Results Row: Payoff Date + Total Interest */
      .results-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (max-width: 640px) {
        .results-grid {
          grid-template-columns: 1fr;
        }
      }

      .metric-card {
        padding: 22px 24px;
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .metric-card.highlight {
        border-color: var(--accent);
        background: linear-gradient(135deg, var(--bg), var(--accent-bg));
      }

      .metric-card h3 {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 12px 0;
        color: var(--text);
      }

      .metric-value {
        font-size: 26px;
        font-weight: 800;
        color: var(--text-h);
        line-height: 1.2;
      }

      .metric-input-wrapper {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }

      .metric-prefix {
        font-size: 24px;
        font-weight: 800;
        color: var(--accent);
      }

      .metric-input {
        font-size: 26px;
        font-weight: 800;
        font-family: inherit;
        color: var(--text-h);
        background: transparent;
        border: none;
        border-bottom: 2px dashed var(--border);
        padding: 0 4px;
        width: 140px;
        outline: none;
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
      }

      .metric-input:focus {
        border-bottom: 2px solid var(--accent);
      }

      .metric-sub {
        font-size: 13px;
        margin: 10px 0 0 0;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .saving-pill {
        font-size: 11px;
        font-weight: 700;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        padding: 2px 6px;
        border-radius: 100px;
      }

      .saving-text {
        color: #10b981;
        font-weight: 600;
      }

      /* Encouragement Nudge Box */
      .nudge-box {
        margin-top: 14px;
        padding: 10px 12px;
        background: rgba(16, 185, 129, 0.08);
        border: 1px dashed rgba(16, 185, 129, 0.4);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }

      .nudge-box:hover {
        background: rgba(16, 185, 129, 0.15);
        border-color: #10b981;
        transform: translateY(-1px);
      }

      .nudge-text {
        font-size: 12px;
        line-height: 1.4;
        color: var(--text-h);
      }

      .nudge-green {
        color: #10b981;
        font-weight: 700;
      }

      .nudge-btn {
        font-size: 11px;
        font-weight: 700;
        background: #10b981;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease-in-out;
        font-family: inherit;
      }

      .nudge-btn:hover {
        opacity: 0.9;
        transform: scale(1.05);
      }

      /* Strategy Display Card */
      .strategy-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .strategy-header-row h3 {
        margin: 0;
      }

      .strategy-title-badge {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-h);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .strategy-tagline {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--accent-bg);
        color: var(--accent);
        border: 1px solid var(--accent-border);
      }

      .strategy-desc-text {
        font-size: 13px;
        color: var(--text);
        margin: 6px 0 0 0;
        line-height: 1.5;
      }

      .strategy-best-for {
        font-size: 13px;
        color: var(--text);
        margin-top: 8px;
        line-height: 1.5;
      }

      .strategy-best-for strong {
        color: var(--text-h);
      }

      /* Card Header with Actions */
      .card-header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        font-family: inherit;
      }

      .btn-action-pill {
        background: var(--accent-bg);
        color: var(--accent);
        border: 1px solid var(--accent-border);
      }

      .btn-action-pill:hover {
        background: var(--accent);
        color: #ffffff;
      }

      .btn-primary {
        background: var(--accent);
        color: #ffffff;
        padding: 10px 20px;
        font-size: 14px;
      }

      .btn-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--accent-bg);
      }

      .btn-secondary {
        background: transparent;
        color: var(--text);
        border: 1px solid var(--border);
        padding: 10px 16px;
        font-size: 14px;
      }

      .btn-secondary:hover {
        background: rgba(244, 243, 236, 0.4);
        color: var(--text-h);
      }

      /* Expandable Add Debt Form Container */
      .add-debt-panel {
        background: rgba(244, 243, 236, 0.3);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: 2fr 1.2fr 1fr 1.2fr;
        gap: 16px;
        align-items: end;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 480px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }

      .input-group {
        margin-bottom: 0;
      }

      .input-group label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 6px;
        color: var(--text-h);
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-wrapper input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 14px;
        background: var(--bg);
        color: var(--text-h);
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
        font-family: inherit;
      }

      .input-wrapper input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-bg);
      }

      .input-wrapper.prefix input {
        padding-left: 28px;
      }

      .input-prefix {
        position: absolute;
        left: 10px;
        color: var(--text);
        font-size: 14px;
        user-select: none;
      }

      .input-wrapper.suffix input {
        padding-right: 28px;
      }

      .input-suffix {
        position: absolute;
        right: 10px;
        color: var(--text);
        font-size: 14px;
        user-select: none;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 16px;
        justify-content: flex-end;
      }

      .error-message {
        font-size: 13px;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 8px 12px;
        border-radius: 8px;
        margin-bottom: 14px;
      }

      /* Active Debts List */
      .empty-state {
        text-align: center;
        padding: 32px 0;
        color: var(--text);
        font-size: 15px;
      }

      .debts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .debt-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(244, 243, 236, 0.2);
        transition: all 0.2s;
      }

      .debt-item:hover {
        border-color: var(--accent-border);
        background: var(--accent-bg);
      }

      .debt-info h4 {
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: var(--text-h);
      }

      .debt-meta {
        font-size: 13px;
        color: var(--text);
        display: flex;
        gap: 16px;
      }

      .debt-value {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .balance-badge {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-h);
        background: var(--border);
        padding: 4px 12px;
        border-radius: 100px;
      }

      .btn-remove {
        background: transparent;
        border: none;
        color: var(--text);
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;
        line-height: 1;
      }

      .btn-remove:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      /* Strategy Comparison Grid Section */
      .comparison-section {
        border: 1px solid var(--accent-border);
        background: linear-gradient(180deg, var(--accent-bg), var(--bg));
        animation: fadeIn 0.25s ease-out;
      }

      .comparison-intro {
        font-size: 14px;
        color: var(--text);
        margin: -10px 0 20px 0;
      }

      .strategy-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .strategy-option-card {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        position: relative;
      }

      .strategy-option-card:hover {
        border-color: var(--accent);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.1);
      }

      .strategy-option-card.selected {
        border-color: var(--accent);
        background: linear-gradient(180deg, var(--accent-bg), var(--bg));
        box-shadow: 0 0 0 2px var(--accent);
      }

      .option-top {
        margin-bottom: 14px;
      }

      .option-title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
      }

      .option-title-row h4 {
        font-size: 16px;
        font-weight: 700;
        margin: 0;
        color: var(--text-h);
      }

      .active-badge {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        background: var(--accent);
        padding: 3px 8px;
        border-radius: 100px;
        flex-shrink: 0;
      }

      .option-desc {
        font-size: 13px;
        color: var(--text);
        margin: 0 0 8px 0;
        line-height: 1.5;
      }

      .option-best-for {
        font-size: 13px;
        color: var(--text);
        margin: 0 0 14px 0;
        line-height: 1.5;
      }

      .option-best-for span {
        color: var(--text-h);
        font-weight: 600;
      }

      .option-stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 12px;
        background: rgba(244, 243, 236, 0.3);
        border: 1px solid var(--border);
        border-radius: 10px;
        margin-bottom: 14px;
      }

      .stat-box {
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text);
        margin-bottom: 2px;
      }

      .stat-val {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-h);
      }

      .stat-sub {
        font-size: 11px;
        font-weight: 600;
        color: #10b981;
        margin-top: 2px;
      }

      .btn-select-strategy {
        width: 100%;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text-h);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }

      .strategy-option-card.selected .btn-select-strategy {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
      }

      .strategy-option-card:hover .btn-select-strategy:not(.selected) {
        background: var(--accent-bg);
        color: var(--accent);
        border-color: var(--accent-border);
      }

      /* Payoff Order Sequence List */
      .payoff-order-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .payoff-step-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(244, 243, 236, 0.25);
        transition: all 0.2s ease-in-out;
        gap: 16px;
      }

      .payoff-step-item:hover {
        border-color: var(--accent-border);
        background: var(--accent-bg);
      }

      .step-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .step-badge {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;
        flex-shrink: 0;
      }

      .step-details h4 {
        font-size: 16px;
        font-weight: 700;
        margin: 0 0 4px 0;
        color: var(--text-h);
      }

      .step-meta {
        font-size: 13px;
        color: var(--text);
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .step-right {
        display: flex;
        align-items: center;
        gap: 24px;
        flex-shrink: 0;
      }

      @media (max-width: 700px) {
        .payoff-step-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .step-right {
          width: 100%;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }
      }

      .step-stat-group {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      @media (max-width: 700px) {
        .step-stat-group {
          align-items: flex-start;
        }
      }

      .step-stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text);
        margin-bottom: 2px;
      }

      .step-stat-val {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-h);
      }

      .step-stat-val.highlight {
        color: var(--accent);
      }

      .step-stat-sub {
        font-size: 11px;
        color: var(--text);
        margin-top: 2px;
      }

      /* Timeline / Table styles */
      .table-responsive {
        width: 100%;
        overflow-x: auto;
        border: 1px solid var(--border);
        border-radius: 12px;
      }

      .timeline-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        text-align: left;
      }

      .timeline-table th {
        background: rgba(244, 243, 236, 0.4);
        color: var(--text-h);
        font-weight: 600;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
      }

      .timeline-table td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        color: var(--text);
      }

      .timeline-table tr:last-child td {
        border-bottom: none;
      }

      .timeline-table tr:hover td {
        background: rgba(244, 243, 236, 0.2);
        color: var(--text-h);
      }

      .interest-col {
        color: #ef4444 !important;
      }

      .balance-col {
        font-weight: 600;
        color: var(--text-h) !important;
      }

      .table-dots {
        text-align: center;
        font-style: italic;
        color: var(--text);
        background: rgba(244, 243, 236, 0.1);
      }

      .table-dots td {
        text-align: center;
        padding: 16px;
      }

      .show-all-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 4px 0;
        font-style: normal;
      }

      /* App Disclaimer Footer */
      .app-disclaimer {
        margin-top: 36px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
        text-align: center;
      }

      .app-disclaimer p {
        font-size: 12px;
        line-height: 1.6;
        color: var(--text);
        max-width: 820px;
        margin: 0 auto;
        opacity: 0.85;
      }

      .app-disclaimer strong {
        color: var(--text-h);
      }
    `,
  ];

  private formatCurrency(val: number): string {
    if (this.localization) {
      return this.localization.formatNumber(val, "currency");
    }
    return `$${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private t(key: string, variables?: Record<string, string | number>): string {
    if (this.localization) {
      const translation = this.localization.t(key, variables);
      if (translation && translation !== "") {
        return translation;
      }
    }
    return key;
  }

  private getStrategyName(key: StrategyKey): string {
    const loc = this.t(`strategies.${key}.name`);
    return loc && loc !== `strategies.${key}.name`
      ? loc
      : STRATEGY_DEFINITIONS[key]?.name || key;
  }

  private getStrategyTagline(key: StrategyKey): string {
    const loc = this.t(`strategies.${key}.tagline`);
    return loc && loc !== `strategies.${key}.tagline`
      ? loc
      : STRATEGY_DEFINITIONS[key]?.tagline || "";
  }

  private getStrategyDescription(key: StrategyKey): string {
    const loc = this.t(`strategies.${key}.description`);
    return loc && loc !== `strategies.${key}.description`
      ? loc
      : STRATEGY_DEFINITIONS[key]?.description || "";
  }

  private getStrategyBestFor(key: StrategyKey): string {
    const loc = this.t(`strategies.${key}.bestFor`);
    return loc && loc !== `strategies.${key}.bestFor`
      ? loc
      : STRATEGY_DEFINITIONS[key]?.bestFor || "";
  }

  private get currencySymbol(): string {
    if (this.localization) {
      const formatted = this.localization.formatNumber(0, "currency");
      const symbol = formatted.replace(/[\d.,\s]/g, "");
      return symbol || "$";
    }
    return "$";
  }

  private switchLocale(locale: string) {
    const targetUrl = locale === "en" ? "/" : `/intl/${locale}`;
    window.history.pushState(null, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  private handleAddDebt(e: Event) {
    e.preventDefault();
    if (!this.newName || !this.newBalance || !this.newRate || !this.newMinPay) {
      this.formError = this.t("debts.form.error_required");
      return;
    }

    const balance = parseFloat(this.newBalance);
    const rate = parseFloat(this.newRate);
    const minPay = parseFloat(this.newMinPay);

    if (isNaN(balance) || balance <= 0) {
      this.formError = this.t("debts.form.error_balance");
      return;
    }
    if (isNaN(rate) || rate < 0) {
      this.formError = this.t("debts.form.error_rate");
      return;
    }
    if (isNaN(minPay) || minPay <= 0) {
      this.formError = this.t("debts.form.error_min_pay");
      return;
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      name: this.newName,
      balance,
      interestRate: rate,
      minimumPayment: minPay,
    };

    this.debts = [...this.debts, newDebt];
    this.newName = "";
    this.newBalance = "";
    this.newRate = "";
    this.newMinPay = "";
    this.formError = "";
    this.isAddingDebt = false;
  }

  private handleRemoveDebt(id: string) {
    this.debts = this.debts.filter((d) => d.id !== id);
  }

  override render() {
    const baselineResult = calculateMinimumOnly(this.debts);
    const activeResult = calculateSchedule(
      this.debts,
      this.extraPayment,
      this.currentStrategyKey,
    );

    const interestSaved = Math.max(
      0,
      parseFloat(baselineResult.totalInterestPaid) - parseFloat(activeResult.totalInterestPaid),
    ).toFixed(2);

    const timeSaved = Math.max(
      0,
      baselineResult.totalMonthsToPayoff - activeResult.totalMonthsToPayoff,
    );

    // Calculate 20% payment bump rounded to nearest $5 (minimum $5 bump)
    const bumpRaw = this.extraPayment > 0 ? this.extraPayment * 0.2 : 50;
    const bumpAmount = Math.max(5, Math.round(bumpRaw / 5) * 5);
    const proposedPayment = this.extraPayment + bumpAmount;
    const proposedResult = calculateSchedule(
      this.debts,
      proposedPayment,
      this.currentStrategyKey,
    );
    const extraInterestSaved = Math.max(
      0,
      parseFloat(activeResult.totalInterestPaid) - parseFloat(proposedResult.totalInterestPaid),
    );
    const extraMonthsSaved = Math.max(
      0,
      activeResult.totalMonthsToPayoff - proposedResult.totalMonthsToPayoff,
    );

    const comparisonItems = compareAllStrategies(this.debts, this.extraPayment, baselineResult);
    if (
      comparisonItems.length > 0 &&
      !comparisonItems.some((item) => item.key === this.currentStrategyKey)
    ) {
      this.currentStrategyKey = comparisonItems[0].key;
    }

    const activeLocale = this.localization?.locale?.startsWith("es") ? "es" : "en";
    const soonerText =
      extraMonthsSaved > 0
        ? this.t("controls.nudge_sooner", { months: extraMonthsSaved })
        : "";

    return html`
      <div class="app-container">
        <!-- 1. Header with Language Switcher -->
        <header class="app-header">
          <h1>${this.t("app.title")}</h1>
          <div class="locale-switcher">
            <button
              class="locale-btn ${activeLocale === "en" ? "active" : ""}"
              @click="${() => this.switchLocale("en")}"
            >
              EN
            </button>
            <button
              class="locale-btn ${activeLocale === "es" ? "active" : ""}"
              @click="${() => this.switchLocale("es")}"
            >
              ES
            </button>
          </div>
        </header>

        <!-- 2. Active Debts Section with Embedded Add Debt Form -->
        <section class="card list-card">
          <div class="card-header-actions">
            <h2>${this.t("debts.title", { count: this.debts.length })}</h2>
            <button
              class="btn btn-action-pill"
              @click="${() => {
                this.isAddingDebt = !this.isAddingDebt;
                this.formError = "";
              }}"
            >
              ${this.isAddingDebt ? this.t("debts.close_form") : this.t("debts.add")}
            </button>
          </div>

          <!-- Expandable Add Debt Form -->
          ${this.isAddingDebt
            ? html`
                <div class="add-debt-panel">
                  ${this.formError
                    ? html`<div class="error-message">${this.formError}</div>`
                    : ""}
                  <form @submit="${this.handleAddDebt}">
                    <div class="form-grid">
                      <div class="input-group">
                        <label htmlFor="debt-name">${this.t("debts.form.name_label")}</label>
                        <div class="input-wrapper">
                          <input
                            id="debt-name"
                            type="text"
                            .value="${this.newName}"
                            @input="${(e: Event) => {
                              this.newName = (e.target as HTMLInputElement).value;
                            }}"
                            placeholder="${this.t("debts.form.name_placeholder")}"
                            required
                          />
                        </div>
                      </div>

                      <div class="input-group">
                        <label htmlFor="debt-balance">${this.t("debts.form.balance_label")}</label>
                        <div class="input-wrapper prefix">
                          <span class="input-prefix">${this.currencySymbol}</span>
                          <input
                            id="debt-balance"
                            type="number"
                            min="0"
                            step="0.01"
                            .value="${this.newBalance}"
                            @input="${(e: Event) => {
                              this.newBalance = (e.target as HTMLInputElement).value;
                            }}"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>

                      <div class="input-group">
                        <label htmlFor="debt-rate">${this.t("debts.form.rate_label")}</label>
                        <div class="input-wrapper suffix">
                          <input
                            id="debt-rate"
                            type="number"
                            min="0"
                            step="0.1"
                            .value="${this.newRate}"
                            @input="${(e: Event) => {
                              this.newRate = (e.target as HTMLInputElement).value;
                            }}"
                            placeholder="0.0"
                            required
                          />
                          <span class="input-suffix">%</span>
                        </div>
                      </div>

                      <div class="input-group">
                        <label htmlFor="debt-min-payment"
                          >${this.t("debts.form.min_payment_label")}</label
                        >
                        <div class="input-wrapper prefix">
                          <span class="input-prefix">${this.currencySymbol}</span>
                          <input
                            id="debt-min-payment"
                            type="number"
                            min="0"
                            step="0.01"
                            .value="${this.newMinPay}"
                            @input="${(e: Event) => {
                              this.newMinPay = (e.target as HTMLInputElement).value;
                            }}"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div class="form-actions">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        @click="${() => {
                          this.isAddingDebt = false;
                          this.formError = "";
                        }}"
                      >
                        ${this.t("debts.form.cancel")}
                      </button>
                      <button type="submit" class="btn btn-primary">
                        ${this.t("debts.form.save")}
                      </button>
                    </div>
                  </form>
                </div>
              `
            : ""}

          <!-- Debts List -->
          ${this.debts.length === 0
            ? html`<div class="empty-state">
                <p>${this.t("debts.empty")}</p>
              </div>`
            : html`<div class="debts-list">
                ${this.debts.map(
                  (debt) => html`
                    <div class="debt-item">
                      <div class="debt-info">
                        <h4>${debt.name}</h4>
                        <div class="debt-meta">
                          <span>${this.t("debts.item.rate", { rate: debt.interestRate })}</span>
                          <span
                            >${this.t("debts.item.min_pay", {
                              amount: debt.minimumPayment,
                            })}</span
                          >
                        </div>
                      </div>
                      <div class="debt-value">
                        <div class="balance-badge">${this.formatCurrency(debt.balance)}</div>
                        <button
                          class="btn-remove"
                          @click="${() => this.handleRemoveDebt(debt.id)}"
                          aria-label="${this.t("debts.item.remove_aria", { name: debt.name })}"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  `,
                )}
              </div>`}
        </section>

        <!-- 3. Top Controls Row: Budget Input + Strategy Selector -->
        ${this.debts.length > 0
          ? html`
              <section class="controls-grid">
                <!-- Additional Snowball Budget Input -->
                <div class="card metric-card">
                  <div>
                    <h3>${this.t("controls.extra_payment_title")}</h3>
                    <div class="metric-input-wrapper">
                      <span class="metric-prefix">${this.currencySymbol}</span>
                      <input
                        id="extra-payment"
                        class="metric-input"
                        type="number"
                        min="0"
                        step="25"
                        .value="${String(this.extraPayment)}"
                        @input="${(e: Event) => {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          this.extraPayment = Math.max(0, val || 0);
                        }}"
                        placeholder="0.00"
                        aria-label="${this.t("controls.extra_payment_title")}"
                      />
                    </div>
                    <p class="metric-sub">${this.t("controls.extra_payment_sub")}</p>
                  </div>

                  ${extraInterestSaved > 0 || extraMonthsSaved > 0
                    ? html`
                        <div
                          class="nudge-box"
                          @click="${() => (this.extraPayment = proposedPayment)}"
                          title="${this.t("controls.nudge_boost", {
                            interest: Math.round(extraInterestSaved),
                            bump: bumpAmount,
                            soonerText,
                          })}"
                        >
                          <div class="nudge-text">
                            ${this.t("controls.nudge_boost", {
                              interest: Math.round(extraInterestSaved),
                              bump: bumpAmount,
                              soonerText,
                            })}
                          </div>
                          <button
                            type="button"
                            class="nudge-btn"
                            @click="${(e: Event) => {
                              e.stopPropagation();
                              this.extraPayment = proposedPayment;
                            }}"
                          >
                            ${this.t("controls.nudge_button", { bump: bumpAmount })}
                          </button>
                        </div>
                      `
                    : ""}
                </div>

                <!-- Current Payoff Strategy Display & Switch Button -->
                <div class="card metric-card">
                  <div class="strategy-header-row">
                    <h3>${this.t("controls.strategy_title")}</h3>
                    <button
                      class="btn btn-action-pill"
                      @click="${() =>
                        (this.isComparingStrategies = !this.isComparingStrategies)}"
                    >
                      ${this.isComparingStrategies
                        ? this.t("controls.close_comparison")
                        : this.t("controls.switch_strategy")}
                    </button>
                  </div>
                  <div class="strategy-title-badge">
                    ${this.getStrategyName(this.currentStrategyKey)}
                    <span class="strategy-tagline"
                      >${this.getStrategyTagline(this.currentStrategyKey)}</span
                    >
                  </div>
                  <p class="strategy-desc-text">
                    ${this.getStrategyDescription(this.currentStrategyKey)}
                  </p>
                  <p class="strategy-best-for">
                    <strong>${this.t("comparison.who_benefits")}</strong>
                    ${this.getStrategyBestFor(this.currentStrategyKey)}
                  </p>
                </div>
              </section>
            `
          : ""}

        <!-- 4. Expandable Strategy Comparison Section -->
        ${this.isComparingStrategies && this.debts.length > 0
          ? html`
              <section class="card comparison-section">
                <div class="card-header-actions">
                  <h2>${this.t("comparison.title")}</h2>
                  <button
                    class="btn btn-action-pill"
                    @click="${() => (this.isComparingStrategies = false)}"
                  >
                    ${this.t("controls.close_comparison")}
                  </button>
                </div>
                <p class="comparison-intro">${this.t("comparison.intro")}</p>

                <div class="strategy-cards-grid">
                  ${comparisonItems.map((item) => {
                    const isSelected = item.key === this.currentStrategyKey;

                    return html`
                      <div
                        class="strategy-option-card ${isSelected ? "selected" : ""}"
                        @click="${() => {
                          this.currentStrategyKey = item.key;
                        }}"
                      >
                        <div class="option-top">
                          <div class="option-title-row">
                            <h4>${this.getStrategyName(item.key)}</h4>
                            ${isSelected
                              ? html`<span class="active-badge"
                                  >${this.t("comparison.active_badge")}</span
                                >`
                              : ""}
                          </div>
                          <p class="option-desc">${this.getStrategyDescription(item.key)}</p>
                          <p class="option-best-for">
                            <span>${this.t("comparison.who_benefits")}</span>
                            ${this.getStrategyBestFor(item.key)}
                          </p>
                        </div>

                        <div>
                          <div class="option-stats-grid">
                            <div class="stat-box">
                              <span class="stat-label"
                                >${this.t("comparison.payoff_time_label")}</span
                              >
                              <span class="stat-val"
                                >${this.t("comparison.payoff_time_val", {
                                  months: item.result.totalMonthsToPayoff,
                                })}</span
                              >
                              ${item.timeSaved > 0
                                ? html`<span class="stat-sub"
                                    >${this.t("comparison.payoff_time_saved", {
                                      months: item.timeSaved,
                                    })}</span
                                  >`
                                : ""}
                            </div>
                            <div class="stat-box">
                              <span class="stat-label"
                                >${this.t("comparison.interest_saved_label")}</span
                              >
                              <span class="stat-val" style="color: #10b981;">
                                ${this.formatCurrency(parseFloat(item.interestSaved))}
                              </span>
                              <span class="stat-sub" style="color: var(--text);">
                                ${this.t("comparison.total_interest_sub", {
                                  amount: parseFloat(item.result.totalInterestPaid),
                                })}
                              </span>
                            </div>
                          </div>

                          <button
                            class="btn-select-strategy ${isSelected ? "selected" : ""}"
                            @click="${(e: Event) => {
                              e.stopPropagation();
                              this.currentStrategyKey = item.key;
                            }}"
                          >
                            ${isSelected
                              ? this.t("comparison.btn_active")
                              : this.t("comparison.btn_select")}
                          </button>
                        </div>
                      </div>
                    `;
                  })}
                </div>
              </section>
            `
          : ""}

        <!-- 5. Results Metrics Row: Payoff Date + Total Interest Paid -->
        ${this.debts.length > 0
          ? html`
              <section class="results-grid">
                <!-- Card 1: Payoff Date -->
                <div class="card metric-card highlight">
                  <h3>${this.t("results.payoff_date_title")}</h3>
                  <div class="metric-value">${activeResult.payoffDate}</div>
                  <p class="metric-sub">
                    ${this.t("results.total_months", {
                      months: activeResult.totalMonthsToPayoff,
                    })}
                    ${timeSaved > 0
                      ? html`<span class="saving-pill"
                          >${this.t("results.months_saved", { months: timeSaved })}</span
                        >`
                      : ""}
                  </p>
                </div>

                <!-- Card 2: Interest Saved (Primary) & Total Interest Paid (Secondary) -->
                <div class="card metric-card">
                  <h3>${this.t("results.interest_saved_title")}</h3>
                  <div class="metric-value" style="color: #10b981;">
                    ${this.formatCurrency(parseFloat(interestSaved))}
                  </div>
                  <p class="metric-sub">
                    ${this.t("results.total_interest_paid", {
                      amount: parseFloat(activeResult.totalInterestPaid),
                    })}
                  </p>
                </div>
              </section>
            `
          : ""}

        <!-- 6. Debt Payoff Chart -->
        ${this.debts.length > 0
          ? html`
              <yeti-debt-payoff-chart
                class="card"
                .debts="${this.debts}"
                .timeline="${activeResult.timeline}"
                .baselineTimeline="${baselineResult.timeline}"
              ></yeti-debt-payoff-chart>
            `
          : ""}

        <!-- 7. Payoff Order & Rollover Sequence Section -->
        ${this.debts.length > 0 &&
        activeResult.payoffOrder &&
        activeResult.payoffOrder.length > 0
          ? html`
              <section class="card payoff-order-card">
                <div class="card-header-actions">
                  <h2>
                    ${this.t("sequence.title", {
                      strategyName: this.getStrategyName(this.currentStrategyKey),
                    })}
                  </h2>
                </div>
                <p
                  class="subtitle"
                  style="font-size: 14px; text-align: left; margin: -10px 0 20px 0;"
                >
                  ${this.t("sequence.intro")}
                </p>

                <div class="payoff-order-list">
                  ${activeResult.payoffOrder.map((step, idx) => {
                    const palette = CHART_PALETTE[idx % CHART_PALETTE.length];
                    const rolloverAmount =
                      idx === 0
                        ? step.snowballPayment - step.minimumPayment
                        : step.snowballPayment -
                          activeResult.payoffOrder[idx - 1].snowballPayment;

                    return html`
                      <div class="payoff-step-item">
                        <div class="step-left">
                          <div class="step-badge" style="background: ${palette.main}">
                            ${step.order}
                          </div>
                          <div class="step-details">
                            <h4>${step.debtName}</h4>
                            <div class="step-meta">
                              <span
                                >${this.t("sequence.balance", { balance: step.balance })}</span
                              >
                              <span>${this.t("sequence.rate", { rate: step.rate })}</span>
                              <span
                                >${this.t("sequence.base_min", {
                                  amount: step.minimumPayment,
                                })}</span
                              >
                            </div>
                          </div>
                        </div>

                        <div class="step-right">
                          <div class="step-stat-group">
                            <span class="step-stat-label"
                              >${this.t("sequence.estimated_payoff_label")}</span
                            >
                            <span class="step-stat-val">${step.payoffDate}</span>
                            <span class="step-stat-sub"
                              >${this.t("sequence.month_sub", { month: step.payoffMonth })}</span
                            >
                          </div>

                          <div class="step-stat-group">
                            <span class="step-stat-label"
                              >${this.t("sequence.snowball_payment_label")}</span
                            >
                            <span class="step-stat-val highlight">
                              ${this.t("sequence.snowball_per_month", {
                                amount: step.snowballPayment,
                              })}
                            </span>
                            <span class="step-stat-sub">
                              ${idx === 0
                                ? this.t("sequence.extra_added", { amount: rolloverAmount })
                                : this.t("sequence.rolled_over", { amount: rolloverAmount })}
                            </span>
                          </div>
                        </div>
                      </div>
                    `;
                  })}
                </div>
              </section>
            `
          : ""}

        <!-- 8. Payoff Schedule Timeline Table -->
        ${this.debts.length > 0
          ? html`<section class="card timeline-card">
              <div class="card-header-actions">
                <h2>
                  ${this.t("schedule.title", {
                    strategyName: this.getStrategyName(this.currentStrategyKey),
                  })}
                </h2>
                ${activeResult.timeline.length > 24
                  ? html`
                      <button
                        class="btn btn-action-pill"
                        @click="${() => (this.showFullSchedule = !this.showFullSchedule)}"
                      >
                        ${this.showFullSchedule
                          ? this.t("schedule.show_first_24")
                          : this.t("schedule.show_all", {
                              months: activeResult.timeline.length,
                            })}
                      </button>
                    `
                  : ""}
              </div>
              <div class="table-responsive">
                <table class="timeline-table">
                  <thead>
                    <tr>
                      <th>${this.t("schedule.col_month")}</th>
                      <th>${this.t("schedule.col_total_paid")}</th>
                      <th>${this.t("schedule.col_interest_paid")}</th>
                      <th>${this.t("schedule.col_remaining_balance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(this.showFullSchedule
                      ? activeResult.timeline
                      : activeResult.timeline.slice(0, 24)
                    ).map(
                      (month) => html`
                        <tr>
                          <td>${month.monthName} ${month.year}</td>
                          <td>${this.formatCurrency(parseFloat(month.totalPaid))}</td>
                          <td class="interest-col">
                            ${this.formatCurrency(parseFloat(month.totalInterestCharged))}
                          </td>
                          <td class="balance-col">
                            ${this.formatCurrency(parseFloat(month.totalRemainingBalance))}
                          </td>
                        </tr>
                      `,
                    )}
                    ${activeResult.timeline.length > 24
                      ? html`<tr class="table-dots">
                          <td colspan="4">
                            <div class="show-all-wrapper">
                              <span>
                                ${this.showFullSchedule
                                  ? this.t("schedule.showing_all", {
                                      total: activeResult.timeline.length,
                                    })
                                  : this.t("schedule.showing_first_24", {
                                      total: activeResult.timeline.length,
                                    })}
                              </span>
                              <button
                                class="btn btn-action-pill"
                                @click="${() => (this.showFullSchedule = !this.showFullSchedule)}"
                              >
                                ${this.showFullSchedule
                                  ? this.t("schedule.collapse")
                                  : this.t("schedule.show_entire", {
                                      months: activeResult.timeline.length,
                                    })}
                              </button>
                            </div>
                          </td>
                        </tr>`
                      : ""}
                  </tbody>
                </table>
              </div>
            </section>`
          : ""}

        <!-- 9. Educational & Legal Disclaimer Footer -->
        <footer class="app-disclaimer">
          <p>
            <strong>Disclaimer:</strong> ${this.t("disclaimer.text")}
          </p>
        </footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yeti-app-ai": YetiAppAi;
  }
}
