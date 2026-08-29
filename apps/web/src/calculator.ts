import { LowestBalanceYetiStrategy, MinimumPaymentYetiStrategy, YetiDebt } from "@yeti/snowball";

export interface CalculatorInfo {}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface TimelineMonth {
  monthIndex: number;
  monthName: string;
  year: number;
  totalPaid: string;
  totalInterestCharged: string;
  totalRemainingBalance: string;
  debtBalances: Record<string, number>;
}

export interface SnowballResult {
  payoffDate: string;
  totalMonthsToPayoff: number;
  totalInterestPaid: string;
  timeline: TimelineMonth[];
}

export function calculateSchedule(
  debts: Debt[],
  extraPayment: number = 0,
  strategyType: "snowball" | "minimumOnly" = "snowball",
): SnowballResult {
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

  // 3. Choose strategy
  const strategy =
    strategyType === "minimumOnly"
      ? new MinimumPaymentYetiStrategy(yetiDebts, totalMinPayment)
      : new LowestBalanceYetiStrategy(yetiDebts, totalBudget);

  // 4. Generate the timeline month-by-month
  const maxMonths = strategy.months;
  const timeline: TimelineMonth[] = [];
  const currentDate = new Date();

  // Track the remaining balance for each debt schedule
  const currentBalances = strategy.schedules.map((s) => s.debt.borrowed);

  // Initial Month 0 state (starting balance before payments)
  const initialDebtBalances: Record<string, number> = {};
  let initialTotalBalance = 0;
  strategy.schedules.forEach((schedule) => {
    const id = schedule.debt.uid || "debt";
    initialDebtBalances[id] = schedule.debt.borrowed;
    initialTotalBalance += schedule.debt.borrowed;
  });

  timeline.push({
    monthIndex: 0,
    monthName: "Start",
    year: currentDate.getFullYear(),
    totalPaid: "0.00",
    totalInterestCharged: "0.00",
    totalRemainingBalance: initialTotalBalance.toFixed(2),
    debtBalances: initialDebtBalances,
  });

  for (let m = 1; m <= maxMonths; m++) {
    let totalPaid = 0;
    let totalInterestCharged = 0;
    let totalRemainingBalance = 0;
    const debtBalances: Record<string, number> = {};

    strategy.schedules.forEach((schedule, index) => {
      if (m <= schedule.payments.length) {
        const payment = schedule.payments[m - 1];
        totalPaid += payment.principal + payment.interest;
        totalInterestCharged += payment.interest;
        currentBalances[index] = Math.max(0, currentBalances[index] - payment.principal);
      }
      totalRemainingBalance += currentBalances[index];
      const id = schedule.debt.uid || `debt-${index}`;
      debtBalances[id] = Math.round(currentBalances[index] * 100) / 100;
    });

    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + m - 1, 1);
    const monthName = targetDate.toLocaleString("default", { month: "short" });
    const year = targetDate.getFullYear();

    timeline.push({
      monthIndex: m,
      monthName,
      year,
      totalPaid: totalPaid.toFixed(2),
      totalInterestCharged: totalInterestCharged.toFixed(2),
      totalRemainingBalance: totalRemainingBalance.toFixed(2),
      debtBalances,
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

export function calculateSnowball(debts: Debt[], extraPayment: number): SnowballResult {
  return calculateSchedule(debts, extraPayment, "snowball");
}

export function calculateMinimumOnly(debts: Debt[]): SnowballResult {
  return calculateSchedule(debts, 0, "minimumOnly");
}
