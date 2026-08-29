import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { calculateMinimumOnly, calculateSnowball, type Debt } from "./calculator";
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
  @state() private debts: Debt[] = INITIAL_DEBTS;
  @state() private extraPayment: number = 300;

  // Form states for adding a new debt
  @state() private newName: string = "";
  @state() private newBalance: string = "";
  @state() private newRate: string = "";
  @state() private newMinPay: string = "";
  @state() private formError: string = "";

  static styles = [
    css`
      /* Modern Glassmorphic Design System */
      .app-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
        box-sizing: border-box;
        text-align: left;
      }

      .app-header {
        margin-bottom: 40px;
        text-align: center;
      }

      .header-badge {
        display: inline-block;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: var(--accent);
        background: var(--accent-bg);
        border: 1px solid var(--accent-border);
        padding: 6px 16px;
        border-radius: 100px;
        margin-bottom: 16px;
      }

      .app-header h1 {
        font-size: 44px;
        font-weight: 800;
        line-height: 1.1;
        margin: 0 0 12px 0;
        letter-spacing: -1.2px;
        background: linear-gradient(135deg, var(--text-h), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        font-size: 18px;
        color: var(--text);
        max-width: 600px;
        margin: 0 auto;
      }

      /* App Grid Layout */
      .app-grid {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 32px;
        align-items: start;
      }

      @media (max-width: 960px) {
        .app-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Panel Styles */
      .panel {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow);
      }

      .panel-section {
        margin-bottom: 32px;
      }

      .panel-section:last-child {
        margin-bottom: 0;
      }

      .panel-section h2 {
        font-size: 18px;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 8px;
        color: var(--text-h);
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
        margin-top: 0;
        margin-bottom: 16px;
        color: var(--text-h);
      }

      /* Form & Inputs */
      .input-group {
        margin-bottom: 20px;
      }

      .input-group label {
        display: block;
        font-size: 14px;
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
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 16px;
        background: var(--bg);
        color: var(--text-h);
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
      }

      .input-wrapper input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-bg);
      }

      .input-wrapper.prefix input {
        padding-left: 32px;
      }

      .input-prefix {
        position: absolute;
        left: 12px;
        color: var(--text);
        font-size: 16px;
        user-select: none;
      }

      .input-wrapper.suffix input {
        padding-right: 32px;
      }

      .input-suffix {
        position: absolute;
        right: 12px;
        color: var(--text);
        font-size: 16px;
        user-select: none;
      }

      .input-help {
        font-size: 12px;
        color: var(--text);
        margin-top: 6px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .add-debt-form input[type="text"] {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 16px;
        background: var(--bg);
        color: var(--text-h);
        box-sizing: border-box;
        transition: all 0.2s ease-in-out;
      }

      .add-debt-form input[type="text"]:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-bg);
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
      }

      .btn-primary {
        background: var(--accent);
        color: #ffffff;
        width: 100%;
        margin-top: 8px;
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--accent-bg);
        opacity: 0.9;
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      /* Dashboard Cards */
      .results-container {
        display: flex;
        flex-direction: column;
      }

      .dashboard-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }

      @media (max-width: 600px) {
        .dashboard-cards {
          grid-template-columns: 1fr;
        }
      }

      .metric-card {
        padding: 24px;
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
        font-size: 28px;
        font-weight: 800;
        color: var(--text-h);
        line-height: 1.2;
      }

      .metric-sub {
        font-size: 13px;
        margin: 8px 0 0 0;
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
        font-size: 16px;
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

      /* Error Messages */
      .error-message {
        font-size: 14px;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 16px;
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
    `,
  ];

  private handleAddDebt(e: Event) {
    e.preventDefault();
    if (!this.newName || !this.newBalance || !this.newRate || !this.newMinPay) {
      this.formError = "Please fill in all fields.";
      return;
    }

    const balance = parseFloat(this.newBalance);
    const rate = parseFloat(this.newRate);
    const minPay = parseFloat(this.newMinPay);

    if (isNaN(balance) || balance <= 0) {
      this.formError = "Balance must be a positive number.";
      return;
    }
    if (isNaN(rate) || rate < 0) {
      this.formError = "Interest rate must be 0 or greater.";
      return;
    }
    if (isNaN(minPay) || minPay <= 0) {
      this.formError = "Minimum payment must be a positive number.";
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
  }

  private handleRemoveDebt(id: string) {
    this.debts = this.debts.filter((d) => d.id !== id);
  }

  override render() {
    const snowballResult = calculateSnowball(this.debts, this.extraPayment);
    const baselineResult = calculateMinimumOnly(this.debts);

    const interestSaved = Math.max(
      0,
      parseFloat(baselineResult.totalInterestPaid) - parseFloat(snowballResult.totalInterestPaid),
    ).toFixed(2);

    const timeSaved = Math.max(
      0,
      baselineResult.totalMonthsToPayoff - snowballResult.totalMonthsToPayoff,
    );

    return html`
      <div class="app-container">
        <header class="app-header">
          <h1>Debt Snowball Calculator</h1>
          <p class="subtitle">
            Accelerate your debt payoff by targeting the smallest balances first and rolling over
            payments.
          </p>
        </header>

        <main class="app-grid">
          <!-- Left Column: Input Panel -->
          <section class="panel input-panel">
            <div class="panel-section">
              <h2>1. Monthly Budget</h2>
              <div class="input-group">
                <label htmlFor="extra-payment"> Additional Monthly Payment (Snowball) </label>
                <div class="input-wrapper prefix">
                  <span class="input-prefix">$</span>
                  <input
                    id="extra-payment"
                    type="number"
                    min="0"
                    .value="${String(this.extraPayment)}"
                    @input="${(e: Event) => {
                      const val = parseFloat((e.target as HTMLInputElement).value);
                      this.extraPayment = Math.max(0, val || 0);
                    }}"
                    placeholder="0.00"
                  />
                </div>
                <p class="input-help">
                  Extra money added to your payments each month to accelerate payoff.
                </p>
              </div>
            </div>

            <div class="panel-section">
              <h2>2. Add a Debt</h2>
              <form @submit="${this.handleAddDebt}" class="add-debt-form">
                ${this.formError ? html`<div class="error-message">${this.formError}</div>` : ""}

                <div class="input-group">
                  <label htmlFor="debt-name">Debt Name</label>
                  <input
                    id="debt-name"
                    type="text"
                    .value="${this.newName}"
                    @input="${(e: Event) => {
                      this.newName = (e.target as HTMLInputElement).value;
                    }}"
                    placeholder="e.g. Visa Credit Card"
                  />
                </div>

                <div class="form-row">
                  <div class="input-group">
                    <label htmlFor="debt-balance">Balance</label>
                    <div class="input-wrapper prefix">
                      <span class="input-prefix">$</span>
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
                      />
                    </div>
                  </div>

                  <div class="input-group">
                    <label htmlFor="debt-rate">Interest Rate</label>
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
                      />
                      <span class="input-suffix">%</span>
                    </div>
                  </div>
                </div>

                <div class="input-group">
                  <label htmlFor="debt-min-payment"> Minimum Monthly Payment </label>
                  <div class="input-wrapper prefix">
                    <span class="input-prefix">$</span>
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
                    />
                  </div>
                </div>

                <button type="submit" class="btn btn-primary">Add Debt</button>
              </form>
            </div>
          </section>

          <!-- Right Column: Results & Active Debts -->
          <section class="results-container">
            <!-- Summary Dashboard -->
            <div class="dashboard-cards">
              <div class="card metric-card highlight">
                <h3>Payoff Date</h3>
                <div class="metric-value">${snowballResult.payoffDate}</div>
                <p class="metric-sub">
                  ${snowballResult.totalMonthsToPayoff} months total
                  ${timeSaved > 0
                    ? html`<span class="saving-pill">-${timeSaved} months</span>`
                    : ""}
                </p>
              </div>

              <div class="card metric-card">
                <h3>Total Interest Paid</h3>
                <div class="metric-value">
                  $${parseFloat(snowballResult.totalInterestPaid).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p class="metric-sub">
                  ${parseFloat(interestSaved) > 0
                    ? html`<span class="saving-text">
                        Saved
                        $${parseFloat(interestSaved).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>`
                    : "With extra snowball"}
                </p>
              </div>
            </div>

            <!-- Active Debts List -->
            <div class="card list-card">
              <h2>Active Debts (${this.debts.length})</h2>
              ${this.debts.length === 0
                ? html`<div class="empty-state">
                    <p>No debts added yet. Start by adding one in the left panel!</p>
                  </div>`
                : html`<div class="debts-list">
                    ${this.debts.map(
                      (debt) => html`
                        <div class="debt-item">
                          <div class="debt-info">
                            <h4>${debt.name}</h4>
                            <div class="debt-meta">
                              <span>Rate: ${debt.interestRate}%</span>
                              <span>Min Pay: $${debt.minimumPayment}</span>
                            </div>
                          </div>
                          <div class="debt-value">
                            <div class="balance-badge">$${debt.balance.toLocaleString()}</div>
                            <button
                              class="btn-remove"
                              @click="${() => this.handleRemoveDebt(debt.id)}"
                              aria-label="Remove ${debt.name}"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      `,
                    )}
                  </div>`}
            </div>

            <!-- Debt Payoff Chart -->
            ${this.debts.length > 0
              ? html`
                  <yeti-debt-payoff-chart
                    class="card"
                    .debts="${this.debts}"
                    .timeline="${snowballResult.timeline}"
                    .baselineTimeline="${baselineResult.timeline}"
                  ></yeti-debt-payoff-chart>
                `
              : ""}

            <!-- Payoff Schedule Timeline -->
            ${this.debts.length > 0
              ? html`<div class="card timeline-card">
                  <h2>Monthly Payoff Schedule</h2>
                  <div class="table-responsive">
                    <table class="timeline-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Total Paid</th>
                          <th>Interest Paid</th>
                          <th>Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${snowballResult.timeline.slice(0, 24).map(
                          (month) => html`
                            <tr>
                              <td>${month.monthName} ${month.year}</td>
                              <td>
                                $${parseFloat(month.totalPaid).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td class="interest-col">
                                $${parseFloat(month.totalInterestCharged).toLocaleString(
                                  undefined,
                                  { minimumFractionDigits: 2 },
                                )}
                              </td>
                              <td class="balance-col">
                                $${parseFloat(month.totalRemainingBalance).toLocaleString(
                                  undefined,
                                  { minimumFractionDigits: 2 },
                                )}
                              </td>
                            </tr>
                          `,
                        )}
                        ${snowballResult.timeline.length > 24
                          ? html`<tr class="table-dots">
                              <td colspan="4">
                                ... showing first 24 months of payoff schedule ...
                              </td>
                            </tr>`
                          : ""}
                      </tbody>
                    </table>
                  </div>
                </div>`
              : ""}
          </section>
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yeti-app-ai": YetiAppAi;
  }
}
