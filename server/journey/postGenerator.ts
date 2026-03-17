import * as db from '../db';
import { nanoid } from 'nanoid';

// GCI tier brackets — never expose exact numbers
const GCI_TIERS = [
  { min: 0,      max: 50000,   label: '$50K GCI milestone' },
  { min: 50000,  max: 100000,  label: '$100K GCI milestone' },
  { min: 100000, max: 150000,  label: '$150K GCI milestone' },
  { min: 150000, max: 200000,  label: '$200K GCI milestone' },
  { min: 200000, max: 250000,  label: '$250K GCI milestone' },
  { min: 250000, max: 300000,  label: '$250K–$300K GCI range' },
  { min: 300000, max: 400000,  label: '$300K–$400K GCI range' },
  { min: 400000, max: 500000,  label: '$400K–$500K GCI range' },
  { min: 500000, max: 750000,  label: '$500K+ GCI milestone' },
  { min: 750000, max: Infinity, label: '$750K+ GCI milestone' },
];

const TRANSACTION_TIERS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

function getGCITierLabel(amount: number): string | null {
  const tier = GCI_TIERS.find(t => amount >= t.min && amount < t.max);
  return tier?.label ?? null;
}

function getTransactionTier(count: number): number | null {
  return TRANSACTION_TIERS.find(t => t === count) ?? null;
}

// Post templates per type
const HEADLINES: Record<string, (meta: any) => string> = {
  level_advance: (m) =>
    `Advanced to Level ${m.newLevel} — ${m.levelName}`,
  deliverable_complete: (m) =>
    `Completed: ${m.deliverableTitle}`,
  team_hire: (m) =>
    `Added a ${m.role} to the team`,
  production_milestone: (m) =>
    m.type === 'gci'
      ? `Hit the ${m.label}`
      : `Crossed ${m.tier} transactions`,
  certification: () =>
    `Earned Certified AgentOS Coach designation`,
  streak: (m) =>
    `${m.days}-day daily engagement streak`,
  coaching_milestone: (m) =>
    `Completed ${m.sessionCount} coaching sessions`,
  culture_win: (m) =>
    `Wrote our team ${m.document}`,
  custom: (m) => m.headline,
};

export async function generatePost(
  userId: number,
  type: string,
  metadata: Record<string, any>,
  defaultVisibility: 'cohort' | 'community' | 'network' = 'cohort'
): Promise<{ postId: string; headline: string; draft: true }> {
  const headlineFn = HEADLINES[type];
  if (!headlineFn) throw new Error(`Unknown post type: ${type}`);

  const headline = headlineFn(metadata);
  const postId = nanoid(16);

  // Always create as unpublished draft — agent reviews before posting
  await db.createJourneyPost({
    postId,
    userId,
    type: type as any,
    visibility: defaultVisibility,
    headline,
    metadata,
    isPublished: false,
  });

  return { postId, headline, draft: true };
}

// Called when a deliverable is marked complete
export async function onDeliverableComplete(
  userId: number,
  deliverableId: string,
  deliverableTitle: string
) {
  const cultureDeliverables = [
    'mission-statement', 'vision-statement', 'core-values'
  ];

  if (cultureDeliverables.includes(deliverableId)) {
    const docNames: Record<string, string> = {
      'mission-statement': 'Mission Statement',
      'vision-statement': 'Vision Statement',
      'core-values': 'Core Values',
    };
    return generatePost(userId, 'culture_win', {
      document: docNames[deliverableId] || deliverableTitle,
    });
  }

  return generatePost(userId, 'deliverable_complete', {
    deliverableTitle,
    deliverableId,
  });
}

// Called when agent advances a level
export async function onLevelAdvance(
  userId: number,
  newLevel: number,
  levelName: string
) {
  return generatePost(
    userId, 'level_advance',
    { newLevel, levelName },
    newLevel >= 3 ? 'community' : 'cohort'
  );
}

// Called when team member is added
export async function onTeamHire(userId: number, role: string) {
  return generatePost(userId, 'team_hire', { role });
}

// Called periodically when financial data is updated
export async function checkProductionMilestones(userId: number) {
  const financials = await db.getUserFinancials(userId);
  const transactions = await db.getUserTransactions(userId);

  const totalGCI = financials
    .filter(f => f.type === 'income')
    .reduce((s, f) => s + Number(f.amount), 0);

  const closedCount = transactions.filter(t => t.status === 'closed').length;

  // Check GCI milestones
  const gciLabel = getGCITierLabel(totalGCI);
  if (gciLabel) {
    const existing = await db.getUserJourneyPosts(userId);
    const alreadyPosted = existing.some(p =>
      p.type === 'production_milestone' &&
      (p.metadata as any)?.label === gciLabel
    );
    if (!alreadyPosted) {
      await generatePost(userId, 'production_milestone', {
        type: 'gci', label: gciLabel, rawAmount: totalGCI,
      });
    }
  }

  // Check transaction milestones
  const txTier = getTransactionTier(closedCount);
  if (txTier) {
    const existing = await db.getUserJourneyPosts(userId);
    const alreadyPosted = existing.some(p =>
      p.type === 'production_milestone' &&
      (p.metadata as any)?.tier === txTier
    );
    if (!alreadyPosted) {
      await generatePost(userId, 'production_milestone', {
        type: 'transactions', tier: txTier, count: closedCount,
      });
    }
  }
}
