// server/wealth/wealthUtils.ts
import { TRACK_MILESTONE_COUNTS } from './milestoneKeys';

export interface MilestoneRow {
  milestoneKey: string;
  status: 'not_started' | 'in_progress' | 'done' | null;
}

/**
 * Compute the Wealth Health Score (0–100).
 * Based on milestone completion across all 5 tracks.
 * Track 1 is weighted more heavily as the foundation.
 */
export function computeWealthHealthScore(milestones: MilestoneRow[]): number {
  const total = Object.values(TRACK_MILESTONE_COUNTS).reduce((a, b) => a + b, 0); // 33
  const done = milestones.filter(m => m.status === 'done').length;
  const inProgress = milestones.filter(m => m.status === 'in_progress').length;
  // Done = full credit, in_progress = half credit
  const score = Math.round(((done + inProgress * 0.5) / total) * 100);
  return Math.min(100, score);
}

// MED-02: Track milestone keys for completion percentage prerequisite checks
const T1_KEYS = [
  't1_business_checking', 't1_business_credit_card', 't1_eo_umbrella_insurance',
  't1_emergency_fund_3mo', 't1_operating_reserve_1mo', 't1_beneficiary_designations', 't1_basic_will',
];
const T2_KEYS = [
  't2_llc_formed', 't2_operating_agreement', 't2_scorp_2553',
  't2_cpa_hired', 't2_accounting_software', 't2_quarterly_est_tax',
];

/**
 * Track unlock logic based on income goal + milestone completion percentage.
 * Track 1 is always unlocked.
 * Track 2: $50K+ income goal
 * Track 3: $80K+ income goal AND at least 33% of Track 2 milestones done
 * Track 4: $100K+ income goal AND at least 50% of Track 2 milestones done
 * Track 5: $250K+ income goal AND at least 85% of Track 1 milestones done
 *
 * MED-02: milestones parameter added so prerequisite completion is enforced.
 * Falls back to income-only gating if milestones not provided.
 */
export function computeUnlockedTrackNumbers(
  incomeGoal: number | null,
  milestones?: MilestoneRow[]
): number[] {
  const goal = incomeGoal ?? 0;
  const unlocked = [1];
  if (goal >= 50000) unlocked.push(2);
  if (milestones) {
    const doneKeys = new Set(milestones.filter(m => m.status === 'done').map(m => m.milestoneKey));
    const t1Pct = T1_KEYS.filter(k => doneKeys.has(k)).length / T1_KEYS.length;
    const t2Pct = T2_KEYS.filter(k => doneKeys.has(k)).length / T2_KEYS.length;
    if (goal >= 80000 && t2Pct >= 0.33) unlocked.push(3); // at least 2/6 T2 milestones
    if (goal >= 100000 && t2Pct >= 0.5) unlocked.push(4); // at least 3/6 T2 milestones
    if (goal >= 250000 && t1Pct >= 0.85) unlocked.push(5); // at least 6/7 T1 milestones
  } else {
    // Fallback: income-only gating (used when milestones not available)
    if (goal >= 75000) unlocked.push(3);
    if (goal >= 120000) unlocked.push(4);
    if (goal >= 250000) unlocked.push(5);
  }
  return unlocked;
}

/**
 * FI Calculator — computes all derived fields from raw inputs.
 */
export function computeFiProjection(input: {
  gci: number;
  expenses: number;
  bizPct: number;
  splitsPct: number;
  taxRate: number;
  tithePct: number;
  savingsRate: number;
  investReturn: number;
  currentSavings: number;
}) {
  const {
    gci, expenses, bizPct, splitsPct, taxRate,
    tithePct, savingsRate, investReturn, currentSavings,
  } = input;

  const grossAfterSplits = gci * (1 - splitsPct / 100);
  const bizExpenses = gci * (bizPct / 100);
  const netBeforeTax = grossAfterSplits - bizExpenses;
  const tithe = netBeforeTax * (tithePct / 100);
  const taxOwed = netBeforeTax * (taxRate / 100);
  const netTakeHome = netBeforeTax - tithe - taxOwed;
  const annualSavings = netTakeHome * (savingsRate / 100);
  const fiNumber = expenses * 25;
  const gap = Math.max(0, fiNumber - currentSavings);
  const r = investReturn / 100;

  // Years to FI using future value formula: FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
  // Solve for n numerically (simple iteration)
  let yearsToFi = 0;
  if (annualSavings > 0 && r > 0) {
    let portfolio = currentSavings;
    while (portfolio < fiNumber && yearsToFi < 100) {
      portfolio = portfolio * (1 + r) + annualSavings;
      yearsToFi++;
    }
  } else if (annualSavings > 0) {
    yearsToFi = gap > 0 ? Math.ceil(gap / annualSavings) : 0;
  }

  const fiYear = new Date().getFullYear() + yearsToFi;
  const monthlyPassiveIncome = fiNumber * (investReturn / 100) / 12;

  return {
    grossAfterSplits: Math.round(grossAfterSplits),
    bizExpenses: Math.round(bizExpenses),
    netBeforeTax: Math.round(netBeforeTax),
    tithe: Math.round(tithe),
    taxOwed: Math.round(taxOwed),
    netTakeHome: Math.round(netTakeHome),
    annualSavings: Math.round(annualSavings),
    fiNumber: Math.round(fiNumber),
    yearsToFi,
    fiYear,
    monthlyPassiveIncome: Math.round(monthlyPassiveIncome),
  };
}
