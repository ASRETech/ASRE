import type { ExecutionInputs, ExecutionScoreBreakdown } from './types';

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function buildExecutionScore(inputs: ExecutionInputs): ExecutionScoreBreakdown {
  const activeLeads = inputs.leads.filter(l => !['closed', 'dead', 'archived'].includes((l.stage || '').toLowerCase())).length;
  const staleLeads = inputs.leads.filter(l => {
    const ts = l.lastActivityAt || l.updatedAt || l.createdAt;
    if (!ts) return true;
    return Date.now() - new Date(ts).getTime() > 48 * 60 * 60 * 1000;
  }).length;

  const pipelineCoverage = clamp((activeLeads / 15) * 100);
  const followUpDiscipline = clamp(activeLeads === 0 ? 60 : ((activeLeads - staleLeads) / Math.max(activeLeads, 1)) * 100);

  const underContractDeals = inputs.transactions.filter(t => ['under-contract', 'under_contract', 'clear-to-close'].includes((t.status || '').toLowerCase())).length;
  const closedDeals = inputs.transactions.filter(t => (t.status || '').toLowerCase() === 'closed').length;
  const dealMomentum = clamp((underContractDeals * 18) + (closedDeals * 28));

  const incomeMonthToDate = inputs.financials
    .filter(f => f.type === 'income')
    .filter(f => !f.date || new Date(f.date) >= startOfCurrentMonth())
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const monthlyIncomeTarget = Number(inputs.profile?.incomeGoal || 0) / 12;
  const revenuePace = monthlyIncomeTarget > 0
    ? clamp((incomeMonthToDate / monthlyIncomeTarget) * 100)
    : clamp(closedDeals * 25 + underContractDeals * 10);

  const consistency = clamp((pipelineCoverage * 0.4) + (followUpDiscipline * 0.6));

  const total = clamp(
    (pipelineCoverage * 0.25) +
    (followUpDiscipline * 0.25) +
    (dealMomentum * 0.2) +
    (revenuePace * 0.2) +
    (consistency * 0.1)
  );

  const label: ExecutionScoreBreakdown['label'] =
    total >= 85 ? 'elite' :
    total >= 70 ? 'strong' :
    total >= 50 ? 'stable' :
    'off_track';

  return {
    pipelineCoverage,
    followUpDiscipline,
    dealMomentum,
    revenuePace,
    consistency,
    total,
    label,
  };
}
