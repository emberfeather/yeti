import { useState, useMemo } from "react"
import { LowestBalanceYetiStrategy, YetiDebt } from "@yeti/snowball"

export interface Debt {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
}

interface TimelineMonth {
  monthIndex: number
  monthName: string
  year: number
  totalPaid: string
  totalInterestCharged: string
  totalRemainingBalance: string
}

interface SnowballResult {
  payoffDate: string
  totalMonthsToPayoff: number
  totalInterestPaid: string
  timeline: TimelineMonth[]
}

function calculateSnowball(debts: Debt[], extraPayment: number): SnowballResult {
  if (debts.length === 0) {
    return {
      payoffDate: "N/A",
      totalMonthsToPayoff: 0,
      totalInterestPaid: "0",
      timeline: []
    }
  }

  // 1. Convert to YetiDebt
  const yetiDebts = debts.map(
    (d) => new YetiDebt(d.balance, d.interestRate, d.minimumPayment, d.id)
  )

  // 2. Sum the minimum payments
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0)
  const totalBudget = totalMinPayment + extraPayment

  // 3. Run LowestBalanceYetiStrategy (Snowball)
  const strategy = new LowestBalanceYetiStrategy(yetiDebts, totalBudget)

  // 4. Generate the timeline month-by-month
  const maxMonths = strategy.months
  const timeline: TimelineMonth[] = []
  const currentDate = new Date()

  // Track the remaining balance for each debt schedule
  const currentBalances = strategy.schedules.map((s) => s.debt.borrowed)

  for (let m = 1; m <= maxMonths; m++) {
    let totalPaid = 0
    let totalInterestCharged = 0
    let totalRemainingBalance = 0

    strategy.schedules.forEach((schedule, index) => {
      if (m <= schedule.payments.length) {
        const payment = schedule.payments[m - 1]
        totalPaid += payment.principal + payment.interest
        totalInterestCharged += payment.interest
        currentBalances[index] = Math.max(0, currentBalances[index] - payment.principal)
      }
      totalRemainingBalance += currentBalances[index]
    })

    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + m - 1, 1)
    const monthName = targetDate.toLocaleString("default", { month: "long" })
    const year = targetDate.getFullYear()

    timeline.push({
      monthIndex: m,
      monthName,
      year,
      totalPaid: totalPaid.toFixed(2),
      totalInterestCharged: totalInterestCharged.toFixed(2),
      totalRemainingBalance: totalRemainingBalance.toFixed(2),
    })
  }

  let payoffDate = "TBD"
  if (maxMonths > 0) {
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + maxMonths - 1)
    payoffDate = targetDate.toLocaleString("default", { month: "long", year: "numeric" })
  }

  return {
    payoffDate,
    totalMonthsToPayoff: maxMonths,
    totalInterestPaid: strategy.interest.toFixed(2),
    timeline
  }
}
import "./App.css"

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
]

function App() {
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS)
  const [extraPayment, setExtraPayment] = useState<number>(300)

  // Form states for adding a new debt
  const [newName, setNewName] = useState("")
  const [newBalance, setNewBalance] = useState("")
  const [newRate, setNewRate] = useState("")
  const [newMinPay, setNewMinPay] = useState("")
  const [formError, setFormError] = useState("")

  // Calculate standard timeline (no extra payment) vs snowball timeline
  const snowballResult = useMemo(() => {
    return calculateSnowball(debts, extraPayment)
  }, [debts, extraPayment])

  const baselineResult = useMemo(() => {
    return calculateSnowball(debts, 0)
  }, [debts])

  // Compute interest savings
  const interestSaved = useMemo(() => {
    const baseInterest = parseFloat(baselineResult.totalInterestPaid)
    const snowballInterest = parseFloat(snowballResult.totalInterestPaid)
    return Math.max(0, baseInterest - snowballInterest).toFixed(2)
  }, [baselineResult, snowballResult])

  const timeSaved = useMemo(() => {
    return Math.max(
      0,
      baselineResult.totalMonthsToPayoff - snowballResult.totalMonthsToPayoff,
    )
  }, [baselineResult, snowballResult])

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newBalance || !newRate || !newMinPay) {
      setFormError("Please fill in all fields.")
      return
    }

    const balance = parseFloat(newBalance)
    const rate = parseFloat(newRate)
    const minPay = parseFloat(newMinPay)

    if (isNaN(balance) || balance <= 0) {
      setFormError("Balance must be a positive number.")
      return
    }
    if (isNaN(rate) || rate < 0) {
      setFormError("Interest rate must be 0 or greater.")
      return
    }
    if (isNaN(minPay) || minPay <= 0) {
      setFormError("Minimum payment must be a positive number.")
      return
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      name: newName,
      balance,
      interestRate: rate,
      minimumPayment: minPay,
    }

    setDebts([...debts, newDebt])
    setNewName("")
    setNewBalance("")
    setNewRate("")
    setNewMinPay("")
    setFormError("")
  }

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id))
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-badge">Yeti Financial Tools</div>
        <h1>Debt Snowball Calculator</h1>
        <p className="subtitle">
          Accelerate your debt payoff by targeting the smallest balances first
          and rolling over payments.
        </p>
      </header>

      <main className="app-grid">
        {/* Left Column: Input Panel */}
        <section className="panel input-panel">
          <div className="panel-section">
            <h2>1. Monthly Budget</h2>
            <div className="input-group">
              <label htmlFor="extra-payment">
                Additional Monthly Payment (Snowball)
              </label>
              <div className="input-wrapper prefix">
                <span className="input-prefix">$</span>
                <input
                  id="extra-payment"
                  type="number"
                  min="0"
                  value={extraPayment}
                  onChange={(e) =>
                    setExtraPayment(
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  placeholder="0.00"
                />
              </div>
              <p className="input-help">
                Extra money added to your payments each month to accelerate
                payoff.
              </p>
            </div>
          </div>

          <div className="panel-section">
            <h2>2. Add a Debt</h2>
            <form onSubmit={handleAddDebt} className="add-debt-form">
              {formError && <div className="error-message">{formError}</div>}

              <div className="input-group">
                <label htmlFor="debt-name">Debt Name</label>
                <input
                  id="debt-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Visa Credit Card"
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="debt-balance">Balance</label>
                  <div className="input-wrapper prefix">
                    <span className="input-prefix">$</span>
                    <input
                      id="debt-balance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="debt-rate">Interest Rate</label>
                  <div className="input-wrapper suffix">
                    <input
                      id="debt-rate"
                      type="number"
                      min="0"
                      step="0.1"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      placeholder="0.0"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="debt-min-payment">
                  Minimum Monthly Payment
                </label>
                <div className="input-wrapper prefix">
                  <span className="input-prefix">$</span>
                  <input
                    id="debt-min-payment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMinPay}
                    onChange={(e) => setNewMinPay(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Add Debt
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Results & Active Debts */}
        <section className="results-container">
          {/* Summary Dashboard */}
          <div className="dashboard-cards">
            <div className="card metric-card highlight">
              <h3>Payoff Date</h3>
              <div className="metric-value">{snowballResult.payoffDate}</div>
              <p className="metric-sub">
                {snowballResult.totalMonthsToPayoff} months total
                {timeSaved > 0 && (
                  <span className="saving-pill">-{timeSaved} months</span>
                )}
              </p>
            </div>

            <div className="card metric-card">
              <h3>Total Interest Paid</h3>
              <div className="metric-value">
                $
                {parseFloat(snowballResult.totalInterestPaid).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}
              </div>
              <p className="metric-sub">
                {parseFloat(interestSaved) > 0 ? (
                  <span className="saving-text">
                    Saved $
                    {parseFloat(interestSaved).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  "With extra snowball"
                )}
              </p>
            </div>
          </div>

          {/* Active Debts List */}
          <div className="card list-card">
            <h2>Active Debts ({debts.length})</h2>
            {debts.length === 0 ? (
              <div className="empty-state">
                <p>
                  No debts added yet. Start by adding one in the left panel!
                </p>
              </div>
            ) : (
              <div className="debts-list">
                {debts.map((debt) => (
                  <div key={debt.id} className="debt-item">
                    <div className="debt-info">
                      <h4>{debt.name}</h4>
                      <div className="debt-meta">
                        <span>Rate: {debt.interestRate}%</span>
                        <span>Min Pay: ${debt.minimumPayment}</span>
                      </div>
                    </div>
                    <div className="debt-value">
                      <div className="balance-badge">
                        ${debt.balance.toLocaleString()}
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveDebt(debt.id)}
                        aria-label={`Remove ${debt.name}`}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payoff Schedule Timeline */}
          {debts.length > 0 && (
            <div className="card timeline-card">
              <h2>Monthly Payoff Schedule</h2>
              <div className="table-responsive">
                <table className="timeline-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Paid</th>
                      <th>Interest Paid</th>
                      <th>Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snowballResult.timeline.slice(0, 24).map((month) => (
                      <tr key={month.monthIndex}>
                        <td>
                          {month.monthName} {month.year}
                        </td>
                        <td>
                          $
                          {parseFloat(month.totalPaid).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="interest-col">
                          $
                          {parseFloat(
                            month.totalInterestCharged,
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="balance-col">
                          $
                          {parseFloat(
                            month.totalRemainingBalance,
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                    {snowballResult.timeline.length > 24 && (
                      <tr className="table-dots">
                        <td colSpan={4}>
                          ... showing first 24 months of payoff schedule ...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
