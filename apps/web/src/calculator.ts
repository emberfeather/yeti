import {
  strategies,
  LowestBalanceYetiStrategy,
  MinimumPaymentYetiStrategy,
  YetiDebt,
} from "@yeti/snowball";

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

export interface PayoffOrderStep {
  order: number;
  debtId: string;
  debtName: string;
  balance: number;
  rate: number;
  minimumPayment: number;
  payoffMonth: number;
  payoffDate: string;
  snowballPayment: number;
  interestPaid: number;
}

export interface SnowballResult {
  payoffDate: string;
  totalMonthsToPayoff: number;
  totalInterestPaid: string;
  timeline: TimelineMonth[];
  payoffOrder: PayoffOrderStep[];
}

export type StrategyKey =
  | "lowestBalance"
  | "highestRate"
  | "balancePaymentRatio"
  | "balanceRateRatio"
  | "highestBalance"
  | "lowestRate"
  | "minimumPayment";

export interface StrategyMeta {
  key: StrategyKey;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bestFor: string;
}

export const STRATEGY_DEFINITIONS: Record<StrategyKey, StrategyMeta> = {
  lowestBalance: {
    key: "lowestBalance",
    name: "Debt Snowball",
    shortName: "Snowball",
    tagline: "Lowest balance first",
    description:
      "By paying off loans with the lowest balance first you can increase your snowball quickly.",
    bestFor:
      "Easier mentally and emotionally to execute since you are able to build momentum quickly and feel good about the progress you make.",
  },
  highestRate: {
    key: "highestRate",
    name: "Debt Avalanche",
    shortName: "Avalanche",
    tagline: "Highest interest rate first",
    description:
      "By paying off the loans with the highest interest rate first you end up paying less in interest in total.",
    bestFor:
      "Saves the most money, but may be more mentally and emotionally challenging since it usually takes longer to feel like it is having an effect.",
  },
  balancePaymentRatio: {
    key: "balancePaymentRatio",
    name: "Cash Flow Optimizer",
    shortName: "Cash Flow",
    tagline: "Lowest balance-to-payment ratio",
    description:
      "Targets debts that unlock the largest monthly minimum payment relief relative to balance size.",
    bestFor: "Rapidly freeing up monthly cash flow and breathing room.",
  },
  balanceRateRatio: {
    key: "balanceRateRatio",
    name: "Balance-to-Rate Blend",
    shortName: "Balanced",
    tagline: "Balanced ratio approach",
    description:
      "A hybrid methodology balancing outstanding debt balance against interest rate severity.",
    bestFor: "A balanced compromise between payoff speed and interest optimization.",
  },
  highestBalance: {
    key: "highestBalance",
    name: "Highest Balance First",
    shortName: "Highest Balance",
    tagline: "Largest balances first",
    description:
      "Tackles the single largest debt balance first to eliminate the heaviest principal burden.",
    bestFor: "Borrowers who want to conquer their biggest loan hurdle first.",
  },
  lowestRate: {
    key: "lowestRate",
    name: "Lowest Rate First",
    shortName: "Lowest Rate",
    tagline: "Lowest interest rate first",
    description: "Focuses on lowest interest rate debts before shifting to higher rates.",
    bestFor: "Specific tax or rate-sequencing preferences.",
  },
  minimumPayment: {
    key: "minimumPayment",
    name: "Minimum Payments Only",
    shortName: "Minimums",
    tagline: "No extra rollover budget",
    description: "Simulates paying only minimum monthly payments with zero payment rollovers.",
    bestFor: "Baseline benchmark comparison.",
  },
};

export function calculateSchedule(
  debts: Debt[],
  extraPayment: number = 0,
  strategyKey: StrategyKey = "lowestBalance",
): SnowballResult {
  if (debts.length === 0) {
    return {
      payoffDate: "N/A",
      totalMonthsToPayoff: 0,
      totalInterestPaid: "0",
      timeline: [],
      payoffOrder: [],
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
  const StrategyClass = (strategies as any)[strategyKey] || LowestBalanceYetiStrategy;
  const strategy =
    strategyKey === "minimumPayment"
      ? new MinimumPaymentYetiStrategy(yetiDebts, totalMinPayment)
      : new StrategyClass(yetiDebts, totalBudget);

  // 4. Generate the timeline month-by-month
  const maxMonths = strategy.months;
  const timeline: TimelineMonth[] = [];
  const currentDate = new Date();

  // Track the remaining balance for each debt schedule
  const currentBalances = strategy.schedules.map((s: any) => s.debt.borrowed);

  // Initial Month 0 state (starting balance before payments)
  const initialDebtBalances: Record<string, number> = {};
  let initialTotalBalance = 0;
  strategy.schedules.forEach((schedule: any) => {
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

    strategy.schedules.forEach((schedule: any, index: number) => {
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

  // 5. Generate the payoff order sequence with rollover payment calculation
  const debtMap = new Map<string, Debt>(debts.map((d) => [d.id, d]));
  let cumulativeMinPayment = 0;

  const payoffOrder: PayoffOrderStep[] = strategy.schedules.map((schedule: any, index: number) => {
    const originalDebt = debtMap.get(schedule.debt.uid) || {
      id: schedule.debt.uid,
      name: `Debt ${index + 1}`,
      balance: schedule.debt.borrowed,
      interestRate: schedule.debt.rate,
      minimumPayment: schedule.debt.minimumPayment,
    };

    cumulativeMinPayment += schedule.debt.minimumPayment;
    const snowballPayment =
      strategyKey === "minimumPayment"
        ? schedule.debt.minimumPayment
        : extraPayment + cumulativeMinPayment;

    const payoffMonth = schedule.months;
    let debtPayoffDateStr = "TBD";
    if (payoffMonth > 0) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + payoffMonth - 1);
      debtPayoffDateStr = targetDate.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    }

    return {
      order: index + 1,
      debtId: originalDebt.id,
      debtName: originalDebt.name,
      balance: originalDebt.balance,
      rate: originalDebt.interestRate,
      minimumPayment: originalDebt.minimumPayment,
      payoffMonth,
      payoffDate: debtPayoffDateStr,
      snowballPayment,
      interestPaid: schedule.interest,
    };
  });

  return {
    payoffDate,
    totalMonthsToPayoff: maxMonths,
    totalInterestPaid: strategy.interest.toFixed(2),
    timeline,
    payoffOrder,
  };
}

export function calculateSnowball(debts: Debt[], extraPayment: number): SnowballResult {
  return calculateSchedule(debts, extraPayment, "lowestBalance");
}

export function calculateMinimumOnly(debts: Debt[]): SnowballResult {
  return calculateSchedule(debts, 0, "minimumPayment");
}

export interface StrategyComparisonItem {
  key: StrategyKey;
  meta: StrategyMeta;
  result: SnowballResult;
  interestSaved: string;
  timeSaved: number;
}

export function compareAllStrategies(
  debts: Debt[],
  extraPayment: number,
  baselineResult: SnowballResult,
): StrategyComparisonItem[] {
  const selectableKeys: StrategyKey[] = [
    "lowestBalance",
    "highestRate",
    "balancePaymentRatio",
    "balanceRateRatio",
    "highestBalance",
    "lowestRate",
  ];

  const seenOrderSignatures = new Set<string>();
  const uniqueItems: StrategyComparisonItem[] = [];

  for (const key of selectableKeys) {
    const result = calculateSchedule(debts, extraPayment, key);
    const orderSignature = result.payoffOrder.map((step) => step.debtId).join("->");

    if (!seenOrderSignatures.has(orderSignature)) {
      seenOrderSignatures.add(orderSignature);

      const interestSaved = Math.max(
        0,
        parseFloat(baselineResult.totalInterestPaid) - parseFloat(result.totalInterestPaid),
      ).toFixed(2);
      const timeSaved = Math.max(
        0,
        baselineResult.totalMonthsToPayoff - result.totalMonthsToPayoff,
      );

      uniqueItems.push({
        key,
        meta: STRATEGY_DEFINITIONS[key],
        result,
        interestSaved,
        timeSaved,
      });
    }
  }

  return uniqueItems;
}
