export type ExecutionLead = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  stage?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActivityAt?: string;
};

export type ExecutionTransaction = {
  id: string;
  status?: string;
  closeDate?: string;
  commission?: number;
  salePrice?: number;
  updatedAt?: string;
};

export type ExecutionFinancial = {
  type: 'income' | 'expense';
  amount: number;
  date?: string;
  category?: string;
};

export type ExecutionProfile = {
  currentLevel?: number;
  incomeGoal?: number;
  name?: string;
};

export type ExecutionInputs = {
  leads: ExecutionLead[];
  transactions: ExecutionTransaction[];
  financials: ExecutionFinancial[];
  profile: ExecutionProfile | null;
  latestCoachingResponse?: string | null;
  sourceSystem: 'local' | 'command';
};

export type ExecutionAction = {
  id: string;
  type: 'follow_up' | 'lead_gen' | 'pipeline' | 'revenue' | 'coaching' | 'schedule';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  why: string;
  route?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionScoreBreakdown = {
  pipelineCoverage: number;
  followUpDiscipline: number;
  dealMomentum: number;
  revenuePace: number;
  consistency: number;
  total: number;
  label: 'off_track' | 'stable' | 'strong' | 'elite';
};

export type ExecutionSummary = {
  activeLeads: number;
  staleLeads: number;
  underContractDeals: number;
  closedDeals: number;
  incomeMonthToDate: number;
  monthlyIncomeTarget: number;
  score: ExecutionScoreBreakdown;
  sourceSystem: 'local' | 'command';
};
