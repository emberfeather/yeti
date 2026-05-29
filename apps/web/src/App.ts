import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LowestBalanceYetiStrategy, YetiDebt } from "@yeti/snowball";
import "./App.css";

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface TimelineMonth {
  monthIndex: number;
  monthName: string;
  year: number;
  totalPaid: string;
  totalInterestCharged: string;
  totalRemainingBalance: string;
}

interface SnowballResult {
  payoffDate: string;
  totalMonthsToPayoff: number;
  totalInterestPaid: string;
  timeline: TimelineMonth[];
}

function calculateSnowball(debts: Debt[], extraPayment: number): SnowballResult {
  if (debts.length === 0) {
    return {
      payoffDate: "N/A",
      totalMonthsToPayoff: 0,
      totalInterestPaid: "0",
      timeline: [],
    };
  }

  // 1. Convert to YetiDebt
  const yetiDebts = debts.map(
    (d) => new YetiDebt(d.balance, d.interestRate, d.minimumPayment, d.id),
  );

  // 2. Sum the minimum payments
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalBudget = totalMinPayment + extraPayment;

  // 3. Run LowestBalanceYetiStrategy (Snowball)
  const strategy = new LowestBalanceYetiStrategy(yetiDebts, totalBudget);

  // 4. Generate the timeline month-by-month
  const maxMonths = strategy.months;
  const timeline: TimelineMonth[] = [];
  const currentDate = new Date();

  // Track the remaining balance for each debt schedule
  const currentBalances = strategy.schedules.map((s) => s.debt.borrowed);

  for (let m = 1; m <= maxMonths; m++) {
    let totalPaid = 0;
    let totalInterestCharged = 0;
    let totalRemainingBalance = 0;

    strategy.schedules.forEach((schedule, index) => {
      if (m <= schedule.payments.length) {
        const payment = schedule.payments[m - 1];
        totalPaid += payment.principal + payment.interest;
        totalInterestCharged += payment.interest;
        currentBalances[index] = Math.max(0, currentBalances[index] - payment.principal);
      }
      totalRemainingBalance += currentBalances[index];
    });

    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + m - 1, 1);
    const monthName = targetDate.toLocaleString("default", { month: "long" });
    const year = targetDate.getFullYear();

    timeline.push({
      monthIndex: m,
      monthName,
      year,
      totalPaid: totalPaid.toFixed(2),
      totalInterestCharged: totalInterestCharged.toFixed(2),
      totalRemainingBalance: totalRemainingBalance.toFixed(2),
    });
  }

  let payoffDate = "TBD";
  if (maxMonths > 0) {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + maxMonths - 1);
    payoffDate = targetDate.toLocaleString("default", { month: "long", year: "numeric" });
  }

  return {
    payoffDate,
    totalMonthsToPayoff: maxMonths,
    totalInterestPaid: strategy.interest.toFixed(2),
    timeline,
  };
}

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

@customElement("yeti-app")
export class YetiApp extends LitElement {
  @state() private debts: Debt[] = INITIAL_DEBTS;
  @state() private extraPayment: number = 300;

  // Form states for adding a new debt
  @state() private newName: string = "";
  @state() private newBalance: string = "";
  @state() private newRate: string = "";
  @state() private newMinPay: string = "";
  @state() private formError: string = "";

  // Render in Light DOM to reuse App.css and index.css without Shadow DOM encapsulations
  override createRenderRoot() {
    return this;
  }

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
    const baselineResult = calculateSnowball(this.debts, 0);

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
          <div class="header-badge">Yeti Financial Tools</div>
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
    "yeti-app": YetiApp;
  }
}
