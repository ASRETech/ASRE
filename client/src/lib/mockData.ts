import type { Lead, Transaction, FinancialEntry, SOP, LevelDeliverable } from './store';
import { LEVELS, PIPELINE_STAGES, LEAD_SOURCES } from './store';

const firstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Emily', 'James', 'Ashley', 'Robert', 'Jessica', 'William', 'Amanda', 'Christopher', 'Stephanie', 'Daniel', 'Nicole', 'Matthew', 'Lisa', 'Andrew', 'Rachel', 'Joshua'];
const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString();
}

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead));
  return d.toISOString();
}

export function generateMockLeads(count: number = 25): Lead[] {
  const stages = ['New Lead', 'Contacted', 'Qualified', 'Appt Set', 'Appt Held', 'Active', 'Under Contract', 'Nurture'];
  return Array.from({ length: count }, (_, i) => {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    return {
      id: `lead-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
      type: randomFrom(['buyer', 'seller', 'both', 'investor'] as const),
      source: randomFrom(LEAD_SOURCES),
      stage: randomFrom(stages),
      budget: randomBetween(150, 800) * 1000,
      timeline: randomFrom(['0-3 months', '3-6 months', '6-12 months', '12+ months']),
      tags: [],
      notes: '',
      createdAt: randomDate(90),
    };
  });
}

export function generateMockTransactions(count: number = 5): Transaction[] {
  const streets = ['Oak St', 'Maple Ave', 'Cedar Ln', 'Pine Dr', 'Elm Ct', 'Birch Way', 'Walnut Blvd', 'Cherry Rd'];
  const statuses: Transaction['status'][] = ['pre-contract', 'under-contract', 'clear-to-close', 'closed'];
  return Array.from({ length: count }, (_, i) => {
    const price = randomBetween(200, 650) * 1000;
    const commRate = randomFrom([2.5, 3, 3.5]);
    const split = randomFrom([70, 75, 80, 85]);
    return {
      id: `txn-${i + 1}`,
      propertyAddress: `${randomBetween(100, 9999)} ${randomFrom(streets)}, Cincinnati, OH`,
      mlsNumber: `MLS${randomBetween(100000, 999999)}`,
      salePrice: price,
      commissionRate: commRate,
      brokerageSplit: split,
      type: randomFrom(['buy', 'sell', 'dual'] as const),
      status: randomFrom(statuses),
      clientName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
      clientId: `lead-${randomBetween(1, 25)}`,
      lenderContact: `${randomFrom(firstNames)} at First National`,
      titleCompany: 'Heritage Title',
      contractDate: randomDate(60),
      closeDate: futureDate(45),
      checklistItems: [
        { id: `cl-${i}-1`, title: 'Contract signed', section: 'Pre-Contract', isComplete: true },
        { id: `cl-${i}-2`, title: 'Earnest money deposited', section: 'Under Contract', isComplete: Math.random() > 0.3 },
        { id: `cl-${i}-3`, title: 'Inspection scheduled', section: 'Under Contract', isComplete: Math.random() > 0.5 },
        { id: `cl-${i}-4`, title: 'Appraisal ordered', section: 'Under Contract', isComplete: Math.random() > 0.6 },
        { id: `cl-${i}-5`, title: 'Title search complete', section: 'Clear to Close', isComplete: Math.random() > 0.7 },
        { id: `cl-${i}-6`, title: 'Final walkthrough', section: 'Closing', isComplete: false },
        { id: `cl-${i}-7`, title: 'Closing documents signed', section: 'Closing', isComplete: false },
      ],
      projectedGCI: Math.round(price * (commRate / 100) * (split / 100)),
    };
  });
}

export function generateMockFinancials(): FinancialEntry[] {
  const incomeCategories = ['Commission', 'Referral Fee', 'Coaching'];
  const expenseCategories = ['Marketing', 'Technology', 'Office', 'Lead Generation', 'Insurance', 'Continuing Education'];
  const entries: FinancialEntry[] = [];

  // Income entries
  for (let i = 0; i < 8; i++) {
    entries.push({
      id: `fin-inc-${i}`,
      type: 'income',
      category: randomFrom(incomeCategories),
      amount: randomBetween(3000, 15000),
      date: randomDate(90),
      notes: '',
    });
  }

  // Expense entries
  for (let i = 0; i < 12; i++) {
    entries.push({
      id: `fin-exp-${i}`,
      type: 'expense',
      category: randomFrom(expenseCategories),
      amount: randomBetween(50, 2000),
      date: randomDate(90),
      notes: '',
    });
  }

  return entries;
}

export function generateMockSOPs(): SOP[] {
  return [
    {
      id: 'sop-1',
      name: 'Buyer Consultation Process',
      category: 'Buyer Experience',
      version: 1,
      status: 'active',
      steps: [
        { stepNumber: 1, title: 'Pre-consultation prep', description: 'Review buyer needs and prepare CMA', assigneeRole: 'Agent', isAutomated: false },
        { stepNumber: 2, title: 'Send pre-consultation packet', description: 'Email buyer guide and questionnaire', assigneeRole: 'EA', isAutomated: true },
        { stepNumber: 3, title: 'Conduct consultation', description: 'In-person or Zoom meeting', assigneeRole: 'Agent', isAutomated: false },
        { stepNumber: 4, title: 'Follow up within 24 hours', description: 'Send thank you and next steps', assigneeRole: 'EA', isAutomated: true },
      ],
      createdAt: randomDate(60),
      updatedAt: randomDate(10),
    },
    {
      id: 'sop-2',
      name: 'Listing Launch Checklist',
      category: 'Seller Experience',
      version: 2,
      status: 'active',
      steps: [
        { stepNumber: 1, title: 'Schedule photography', description: 'Book photographer within 48 hours', assigneeRole: 'EA', isAutomated: false },
        { stepNumber: 2, title: 'Write listing description', description: 'Draft MLS description and marketing copy', assigneeRole: 'Agent', isAutomated: false },
        { stepNumber: 3, title: 'Enter in MLS', description: 'Input all listing data', assigneeRole: 'EA', isAutomated: false },
        { stepNumber: 4, title: 'Launch marketing', description: 'Social media, email blast, sign install', assigneeRole: 'Marketing', isAutomated: true },
      ],
      createdAt: randomDate(90),
      updatedAt: randomDate(5),
    },
    {
      id: 'sop-3',
      name: 'New Lead Response',
      category: 'Operations',
      version: 1,
      status: 'active',
      steps: [
        { stepNumber: 1, title: 'Acknowledge within 5 minutes', description: 'Auto-text confirmation', assigneeRole: 'System', isAutomated: true },
        { stepNumber: 2, title: 'Personal call within 1 hour', description: 'Agent calls to qualify', assigneeRole: 'Agent', isAutomated: false },
        { stepNumber: 3, title: 'Enter in CRM', description: 'Log all details and set follow-up', assigneeRole: 'EA', isAutomated: false },
        { stepNumber: 4, title: 'Enroll in drip sequence', description: 'Add to appropriate nurture campaign', assigneeRole: 'System', isAutomated: true },
      ],
      createdAt: randomDate(45),
      updatedAt: randomDate(15),
    },
  ];
}

export function generateDeliverables(currentLevel: number): LevelDeliverable[] {
  const deliverables: LevelDeliverable[] = [];
  LEVELS.forEach((level) => {
    level.deliverables.forEach((d) => {
      deliverables.push({
        id: d.id,
        level: level.level,
        title: d.title,
        description: d.description,
        moduleRoute: d.moduleRoute,
        isComplete: level.level < currentLevel ? true : false,
      });
    });
  });
  return deliverables;
}
