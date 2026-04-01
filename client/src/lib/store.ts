// ASRE Global Store
// Design: "Command Center" — Swiss Design + Modern SaaS
// All state management for the MVP using React-friendly patterns

export interface User {
  id: string;
  name: string;
  email: string;
  brokerage: string;
  marketCenter: string;
  state: string;
  yearsExperience: number;
  gciLastYear: number;
  teamSize: number;
  currentLevel: number;
  operationalScore: number;
  incomeGoal: number;
  avatar?: string;
  diagnosticAnswers?: Record<string, 'yes' | 'no' | 'partial'>;
  topProblems?: string[];
}

export interface LevelDeliverable {
  id: string;
  level: number;
  title: string;
  description: string;
  moduleRoute: string;
  isComplete: boolean;
  completedAt?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'both' | 'investor' | 'renter';
  source: string;
  stage: string;
  budget: number;
  timeline: string;
  assignedAgentId?: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  propertyAddress: string;
  mlsNumber: string;
  salePrice: number;
  commissionRate: number;
  brokerageSplit: number;
  type: 'buy' | 'sell' | 'dual';
  status: 'pre-contract' | 'under-contract' | 'clear-to-close' | 'closed' | 'cancelled';
  clientName: string;
  clientId: string;
  lenderContact: string;
  titleCompany: string;
  contractDate: string;
  closeDate: string;
  checklistItems: ChecklistItem[];
  projectedGCI: number;
  actualGCI?: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  section: string;
  isComplete: boolean;
  dueDate?: string;
  assignee?: string;
}

export interface FinancialEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  transactionId?: string;
  notes: string;
}

export interface SOP {
  id: string;
  name: string;
  category: string;
  version: number;
  status: 'active' | 'draft' | 'archived';
  steps: SOPStep[];
  createdAt: string;
  updatedAt: string;
}

export interface SOPStep {
  stepNumber: number;
  title: string;
  description: string;
  assigneeRole: string;
  isAutomated: boolean;
}

export interface ComplianceLog {
  id: string;
  type: string;
  inputText: string;
  flaggedTerms: string[];
  result: 'pass' | 'flagged';
  timestamp: string;
}

export interface FlaggedItem {
  term: string;
  reason: string;
  suggestion: string;
  severity: 'warning' | 'violation';
}

export interface CultureDoc {
  missionStatement: string;
  visionStatement: string;
  coreValues: string[];
  teamCommitments: string[];
}

// Level definitions
export const LEVELS = [
  {
    level: 1,
    name: 'The Solo Agent',
    description: 'Master the fundamentals. Build your personal economic model, organize your database, and establish your daily disciplines.',
    deliverables: [
      { id: 'l1-d1', title: 'Personal Economic Model', description: 'Interactive calculator showing your income path', moduleRoute: '/financials' },
      { id: 'l1-d2', title: 'Database Setup', description: '1,000+ contacts organized and tagged', moduleRoute: '/pipeline' },
      { id: 'l1-d3', title: 'Lead Generation Sources', description: 'At least 2 active lead sources identified', moduleRoute: '/pipeline' },
      { id: 'l1-d4', title: 'Calendar Architecture', description: 'Weekly time-block template established', moduleRoute: '/level' },
      { id: 'l1-d5', title: 'Personal Mission Statement', description: 'Your guiding purpose, clearly articulated', moduleRoute: '/culture' },
      { id: 'l1-d6', title: '4-1-1 Goal Setting', description: 'Annual/monthly/weekly goal cascade', moduleRoute: '/level' },
    ]
  },
  {
    level: 2,
    name: 'First Administrative Hire',
    description: 'Leverage begins here. Document your processes, hire your first EA, and build the foundation for a real business.',
    deliverables: [
      { id: 'l2-d1', title: 'EA Job Scorecard', description: 'Specific measurable expectations for your admin', moduleRoute: '/library' },
      { id: 'l2-d2', title: 'Admin SOP Library', description: 'First 5 SOPs documented and operational', moduleRoute: '/library' },
      { id: 'l2-d3', title: 'First P&L', description: 'Income, expenses, and net — simple version', moduleRoute: '/financials' },
      { id: 'l2-d4', title: 'Communication Standards', description: 'Agent + EA workflow documented', moduleRoute: '/library' },
      { id: 'l2-d5', title: 'Culture Foundation', description: 'Mission, Vision, Values — first draft', moduleRoute: '/culture' },
    ]
  },
  {
    level: 3,
    name: "First Buyer's Agent",
    description: 'Scale your production. Hire your first buyer agent, build lead assignment protocols, and model team economics.',
    deliverables: [
      { id: 'l3-d1', title: 'Buyer Agent Job Scorecard', description: 'Role expectations and production minimums', moduleRoute: '/library' },
      { id: 'l3-d2', title: 'Lead Assignment Protocol', description: 'How leads get routed to agents', moduleRoute: '/pipeline' },
      { id: 'l3-d3', title: '30-Day Onboarding Curriculum', description: 'New agent training program', moduleRoute: '/library' },
      { id: 'l3-d4', title: 'Compensation Model', description: 'Commission splits and bonuses documented', moduleRoute: '/financials' },
      { id: 'l3-d5', title: 'Accountability Framework', description: 'Weekly review structure for team', moduleRoute: '/level' },
      { id: 'l3-d6', title: 'Team Branding Guidelines', description: 'Visual identity standards', moduleRoute: '/library' },
      { id: 'l3-d7', title: 'Updated P&L', description: 'P&L with buyer agent costs modeled', moduleRoute: '/financials' },
    ]
  },
  {
    level: 4,
    name: "Multiple Buyer's Agents",
    description: 'Build the machine. Establish meeting rhythms, scorecards, recruiting pipeline, and operating system foundations.',
    deliverables: [
      { id: 'l4-d1', title: 'Team Meeting Structure', description: 'L10 meeting agenda and cadence', moduleRoute: '/level' },
      { id: 'l4-d2', title: 'Agent Scorecards', description: 'Production minimums and KPI tracking', moduleRoute: '/level' },
      { id: 'l4-d3', title: 'Written Culture Document', description: 'Formalized culture code', moduleRoute: '/culture' },
      { id: 'l4-d4', title: 'Lead Distribution System', description: 'Automated lead routing rules', moduleRoute: '/pipeline' },
      { id: 'l4-d5', title: 'Recruiting Pipeline Tracker', description: 'Agent recruiting funnel', moduleRoute: '/level' },
      { id: 'l4-d6', title: 'Full Team P&L', description: 'Commission expense modeling', moduleRoute: '/financials' },
      { id: 'l4-d7', title: 'EOS Vision/Traction Organizer', description: 'V/TO strategic document', moduleRoute: '/level' },
      { id: 'l4-d8', title: '90-Day Sprint Planner', description: 'Rocks + weekly check-in system', moduleRoute: '/level' },
    ]
  },
  {
    level: 5,
    name: 'Listing Specialist + Director of Ops',
    description: 'Departmentalize. Add listing capability, hire operations leadership, and build a full SOP library.',
    deliverables: [
      { id: 'l5-d1', title: 'Listing Specialist Scorecard', description: 'Role definition and expectations', moduleRoute: '/library' },
      { id: 'l5-d2', title: 'Listing Consultation SOP', description: 'Standardized listing presentation', moduleRoute: '/library' },
      { id: 'l5-d3', title: 'Seller Experience Standards', description: 'Client experience documentation', moduleRoute: '/library' },
      { id: 'l5-d4', title: 'Director of Operations Role', description: 'Leadership role definition', moduleRoute: '/library' },
      { id: 'l5-d5', title: 'Dept-Based Org Chart', description: 'Production vs. operations structure', moduleRoute: '/level' },
      { id: 'l5-d6', title: 'Full SOP Library', description: 'All departments documented', moduleRoute: '/library' },
      { id: 'l5-d7', title: 'Updated P&L', description: 'Leadership compensation modeled', moduleRoute: '/financials' },
    ]
  },
  {
    level: 6,
    name: 'Full Leadership Team',
    description: 'Lead leaders. Build department P&Ls, annual planning, and succession capability.',
    deliverables: [
      { id: 'l6-d1', title: 'Leadership Accountability Chart', description: 'Who owns what result', moduleRoute: '/level' },
      { id: 'l6-d2', title: 'Department P&Ls', description: 'Financial accountability by department', moduleRoute: '/financials' },
      { id: 'l6-d3', title: 'Annual Business Plan', description: 'One-page strategic plan', moduleRoute: '/level' },
      { id: 'l6-d4', title: 'KPI Dashboard by Department', description: 'Departmental scorecards', moduleRoute: '/level' },
      { id: 'l6-d5', title: 'Agent Retention Strategy', description: 'Keeping top talent', moduleRoute: '/culture' },
      { id: 'l6-d6', title: 'Succession Plan', description: '30-day absence test', moduleRoute: '/level' },
    ]
  },
  {
    level: 7,
    name: 'The 7th Level Business',
    description: 'True ownership. The business runs without you. Define your owner role, model exit options, and build your legacy.',
    deliverables: [
      { id: 'l7-d1', title: 'Operational Independence', description: 'Verification that business runs without you', moduleRoute: '/level' },
      { id: 'l7-d2', title: 'Owner Role Definition', description: 'Board-level, not operational', moduleRoute: '/level' },
      { id: 'l7-d3', title: 'Exit Strategy Options', description: 'Modeled exit scenarios', moduleRoute: '/financials' },
      { id: 'l7-d4', title: 'Business Valuation', description: 'Understanding your business worth', moduleRoute: '/financials' },
      { id: 'l7-d5', title: 'Legacy Document', description: 'Your lasting impact', moduleRoute: '/culture' },
    ]
  },
];

export const PIPELINE_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Appt Set',
  'Appt Held',
  'Active',
  'Under Contract',
  'Closed',
  'Nurture',
  'Dead',
];

export const LEAD_SOURCES = [
  'Sphere of Influence',
  'Open House',
  'Online Lead',
  'Referral',
  'Sign Call',
  'Social Media',
  'Past Client',
  'Door Knock',
  'Expired/FSBO',
  'Paid Advertising',
  'Other',
];

export const DIAGNOSTIC_QUESTIONS = [
  { id: 'q1', text: 'Do you have a defined org chart or role structure?' },
  { id: 'q2', text: 'Do you have a separate business bank account + allocation system?' },
  { id: 'q3', text: 'Do you have a CRM with active follow-up sequences?' },
  { id: 'q4', text: 'Do you have written SOPs for buyer and seller processes?' },
  { id: 'q5', text: 'Do you have a marketing system that runs without you daily?' },
  { id: 'q6', text: 'Do you track weekly leading indicators?' },
  { id: 'q7', text: 'Do you have a defined client communication cadence?' },
  { id: 'q8', text: 'Do you have a time-blocked calendar architecture?' },
];

export const TOP_PROBLEMS = [
  'Lead generation is inconsistent',
  'No systems or SOPs in place',
  'Can\'t find or keep good team members',
  'Finances are unpredictable',
  'Marketing is sporadic or non-existent',
  'Time management is a constant struggle',
  'No accountability structure',
  'Don\'t know my numbers',
  'Compliance concerns',
  'Burnout / working too many hours',
];

export const FAIR_HOUSING_KEYWORDS = [
  { word: 'family-friendly', suggestion: 'Describe amenities instead: "near parks and playgrounds"', severity: 'warning' as const },
  { word: 'perfect for families', suggestion: 'Describe the property features, not the ideal occupant', severity: 'warning' as const },
  { word: 'no children', suggestion: 'Cannot discriminate based on familial status', severity: 'violation' as const },
  { word: 'adults only', suggestion: 'Cannot restrict based on age/familial status (except 55+ communities)', severity: 'violation' as const },
  { word: 'Christian neighborhood', suggestion: 'Cannot reference religious demographics of an area', severity: 'violation' as const },
  { word: 'church nearby', suggestion: 'Use "places of worship nearby" or omit', severity: 'warning' as const },
  { word: 'walking distance to church', suggestion: 'Use "near community amenities" instead', severity: 'warning' as const },
  { word: 'exclusive', suggestion: 'May imply discriminatory intent; use "private" or "gated" if describing physical features', severity: 'warning' as const },
  { word: 'master bedroom', suggestion: 'Consider using "primary bedroom" per industry guidance', severity: 'warning' as const },
  { word: 'handicap', suggestion: 'Use "accessible" or "ADA-compliant" instead', severity: 'warning' as const },
  { word: 'wheelchair ramp', suggestion: 'Acceptable to describe features factually, but don\'t imply limitation', severity: 'warning' as const },
  { word: 'no pets', suggestion: 'Cannot refuse service/emotional support animals; specify "no pets" policy carefully', severity: 'warning' as const },
  { word: 'bachelor pad', suggestion: 'Describes ideal occupant, not the property. Use "one-bedroom" or "studio"', severity: 'warning' as const },
  { word: 'man cave', suggestion: 'Gendered language; use "bonus room" or "recreation room"', severity: 'warning' as const },
  { word: 'mother-in-law suite', suggestion: 'Use "guest suite" or "accessory dwelling unit"', severity: 'warning' as const },
  { word: 'safe neighborhood', suggestion: 'Subjective and may imply racial bias; describe specific features instead', severity: 'warning' as const },
  { word: 'integrated', suggestion: 'Do not reference racial composition of neighborhoods', severity: 'violation' as const },
  { word: 'ethnic', suggestion: 'Do not reference ethnic demographics of areas', severity: 'violation' as const },
];
