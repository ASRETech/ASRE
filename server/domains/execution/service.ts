import { nanoid } from 'nanoid';
import type { ExecutionAction, ExecutionInputs, ExecutionSummary } from './types';
import { buildExecutionScore } from './scoring';
import { fetchCommandContacts } from '../../integrations/command/client';
import { mapCommandContactToLead } from '../../integrations/command/mapper';

async function loadExecutionInputs(userId: number): Promise<ExecutionInputs> {
  // NOTE: Replace these stubs with real repositories
  const localLeads: any[] = (await (global as any).db?.getUserLeads?.(userId)) || [];
  const localTransactions: any[] = (await (global as any).db?.getUserTransactions?.(userId)) || [];
  const localFinancials: any[] = (await (global as any).db?.getUserFinancials?.(userId)) || [];
  const profile: any = (await (global as any).db?.getUserProfile?.(userId)) || null;
  const latestCoachingResponse: string | null = null;

  // If user has a Command connection, prefer Command data
  let sourceSystem: 'local' | 'command' = 'local';
  let leads = localLeads;

  const accessToken = (await (global as any).db?.getCommandAccessToken?.(userId)) || null;

  if (accessToken) {
    try {
      const contacts = await fetchCommandContacts(accessToken);
      leads = (contacts || []).map((c: any) => mapCommandContactToLead(c, userId));
      sourceSystem = 'command';
    } catch (err) {
      // fallback silently to local data
      leads = localLeads;
      sourceSystem = 'local';
    }
  }

  return {
    leads,
    transactions: localTransactions,
    financials: localFinancials,
    profile,
    latestCoachingResponse,
    sourceSystem,
  };
}

function createAction(partial: Omit<ExecutionAction, 'id'>): ExecutionAction {
  return { id: nanoid(), ...partial };
}

function buildActions(inputs: ExecutionInputs): ExecutionAction[] {
  const actions: ExecutionAction[] = [];

  const activeLeads = inputs.leads.filter(l => !['closed', 'dead', 'archived'].includes((l.stage || '').toLowerCase()));

  const staleLeads = activeLeads.filter(l => {
    const ts = l.lastActivityAt || l.updatedAt || l.createdAt;
    if (!ts) return true;
    return Date.now() - new Date(ts).getTime() > 48 * 60 * 60 * 1000;
  });

  // 1. Follow-ups (highest ROI)
  staleLeads.slice(0, 5).forEach(l => {
    actions.push(createAction({
      type: 'follow_up',
      priority: 'high',
      title: `Follow up with ${l.firstName || 'lead'}`,
      message: 'Reconnect and move the conversation forward today.',
      why: 'Leads without recent activity are the biggest conversion leak.',
      route: '/execution/pipeline',
      metadata: { leadId: l.id }
    }));
  });

  // 2. Pipeline coverage
  if (activeLeads.length < 10) {
    actions.push(createAction({
      type: 'lead_gen',
      priority: 'critical',
      title: 'Generate new leads',
      message: 'Add at least 5 new contacts to your pipeline today.',
      why: 'Pipeline is too thin to support consistent closings.',
      route: '/execution/pipeline'
    }));
  }

  // 3. Pipeline movement
  if (activeLeads.length >= 10 && staleLeads.length > 0) {
    actions.push(createAction({
      type: 'pipeline',
      priority: 'high',
      title: 'Move deals forward',
      message: 'Advance conversations to the next stage.',
      why: 'Stalled pipeline reduces conversion rate.',
      route: '/execution/pipeline'
    }));
  }

  // 4. Revenue pressure
  const income = inputs.financials
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  if (income < 10000) {
    actions.push(createAction({
      type: 'revenue',
      priority: 'critical',
      title: 'Create revenue opportunities',
      message: 'Book appointments and push toward signed agreements.',
      why: 'You are behind revenue pace.',
      route: '/execution/schedule'
    }));
  }

  // 5. Coaching reinforcement
  if (inputs.latestCoachingResponse) {
    actions.push(createAction({
      type: 'coaching',
      priority: 'medium',
      title: 'Apply coaching insight',
      message: inputs.latestCoachingResponse,
      why: 'Coaching is only valuable if applied.',
      route: '/growth/coaching'
    }));
  }

  // 6. Scheduling
  actions.push(createAction({
    type: 'schedule',
    priority: 'medium',
    title: 'Time block your day',
    message: 'Convert these actions into a structured schedule.',
    why: 'Execution requires time allocation.',
    route: '/execution/schedule'
  }));

  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return actions.sort((a, b) => order[a.priority] - order[b.priority]);
}

export async function getExecutionSummary(userId: number): Promise<ExecutionSummary> {
  const inputs = await loadExecutionInputs(userId);

  const activeLeads = inputs.leads.filter(l => !['closed', 'dead', 'archived'].includes((l.stage || '').toLowerCase())).length;
  const staleLeads = inputs.leads.filter(l => {
    const ts = l.lastActivityAt || l.updatedAt || l.createdAt;
    if (!ts) return true;
    return Date.now() - new Date(ts).getTime() > 48 * 60 * 60 * 1000;
  }).length;

  const underContractDeals = inputs.transactions.filter(t => ['under-contract', 'under_contract', 'clear-to-close'].includes((t.status || '').toLowerCase())).length;
  const closedDeals = inputs.transactions.filter(t => (t.status || '').toLowerCase() === 'closed').length;

  const incomeMonthToDate = inputs.financials
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const monthlyIncomeTarget = Number(inputs.profile?.incomeGoal || 0) / 12;

  const score = buildExecutionScore(inputs);

  return {
    activeLeads,
    staleLeads,
    underContractDeals,
    closedDeals,
    incomeMonthToDate,
    monthlyIncomeTarget,
    score,
    sourceSystem: inputs.sourceSystem,
  };
}

export async function getExecutionActions(userId: number) {
  const inputs = await loadExecutionInputs(userId);
  const actions = buildActions(inputs);
  const score = buildExecutionScore(inputs);

  return {
    actions: actions.slice(0, 10),
    score,
    sourceSystem: inputs.sourceSystem,
  };
}
