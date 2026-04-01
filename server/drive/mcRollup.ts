import * as db from '../db';
import { setSheetValues, createSpreadsheet, createFolder } from './googleDrive';

function computeHealthScore(
  deliverables: { isComplete: boolean; createdAt: Date }[],
  leads: { stage: string; createdAt: Date }[],
  transactions: { status: string }[]
): number {
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const leadGen = Math.min(25, leads.filter(l => new Date(l.createdAt) > d30).length * 2);
  const goalScore = Math.min(25, deliverables.filter(d => d.isComplete).length * 2);
  const txScore = Math.min(20, transactions.filter(t => t.status === 'active').length * 4);
  const delScore = Math.min(15, deliverables.filter(d => d.isComplete).length * 2);
  return Math.min(100, leadGen + goalScore + txScore + delScore + 15);
}

export async function buildMCRollup(
  mcUserId: number,
  mcName: string,
  agentUserIds: number[]
): Promise<{ rollupId: string; folderId: string }> {
  const tokens = await db.getDriveTokens(mcUserId);
  if (!tokens) throw new Error('No Drive tokens for MC user');
  const { accessToken: at, refreshToken: rt } = tokens;

  const folderId = await createFolder(at, rt, `ASRE — ${mcName} Dashboard`);
  const rollupId = await createSpreadsheet(at, rt, 'Agent Scorecard — Top 20', folderId);

  const headers = [
    'Agent Name', 'MREA Level', 'Deliverables Complete',
    'Health Score', 'YTD GCI', 'Contacts/Wk', 'Appts/Wk',
    'Active Pipeline', 'Open Transactions', 'Goal Pace %',
    'Last Active', 'Status',
  ];
  await setSheetValues(at, rt, rollupId, 'A1', [headers]);
  await refreshMCRollup(mcUserId, rollupId, agentUserIds);
  await db.saveMCRollupSheetId(mcUserId, rollupId, folderId);

  return { rollupId, folderId };
}

export async function refreshMCRollup(
  mcUserId: number,
  rollupSheetId: string,
  agentUserIds: number[]
): Promise<void> {
  const tokens = await db.getDriveTokens(mcUserId);
  if (!tokens) return;
  const { accessToken: at, refreshToken: rt } = tokens;
  const rows: (string | number | null)[][] = [];

  for (const agentId of agentUserIds) {
    try {
      const [profile, deliverables, leads, transactions, pulses] = await Promise.all([
        db.getAgentProfile(agentId),
        db.getUserDeliverables(agentId),
        db.getUserLeads(agentId),
        db.getUserTransactions(agentId),
        db.getWeeklyPulses(agentId, 4),
      ]);
      if (!profile) continue;

      const completedDels = deliverables.filter(d => d.isComplete).length;
      const healthScore = computeHealthScore(deliverables, leads, transactions);
      const ytdGci = transactions
        .filter(t => t.status === 'closed' && new Date((t as any).closingDate ?? '').getFullYear() === new Date().getFullYear())
        .reduce((s, t) => s + ((t as any).commissionAmount ?? 0), 0);
      const avgContacts = pulses.length
        ? Math.round(pulses.reduce((s, p) => s + ((p as any).contactsMade ?? 0), 0) / pulses.length)
        : 0;
      const avgAppts = pulses.length
        ? Math.round(pulses.reduce((s, p) => s + ((p as any).appointmentsSet ?? 0), 0) / pulses.length)
        : 0;
      const activePipeline = leads.filter(l => l.stage !== 'closed').length;
      const openTx = transactions.filter(t => t.status === 'under-contract' || t.status === 'pre-contract').length;
      const goalPace = (profile as any).incomeGoal
        ? Math.round((ytdGci / ((profile as any).incomeGoal * (new Date().getMonth() + 1) / 12)) * 100)
        : null;
      const lastActive = (profile as any).updatedAt
        ? new Date((profile as any).updatedAt).toLocaleDateString()
        : 'Unknown';
      const status =
        healthScore >= 70 ? '🟢 On Track' : healthScore >= 40 ? '🟡 Needs Attention' : '🔴 At Risk';

      rows.push([
        (profile as any).name ?? 'Unknown',
        `Level ${(profile as any).currentLevel ?? 1}`,
        `${completedDels}/${deliverables.length}`,
        healthScore,
        ytdGci,
        avgContacts,
        avgAppts,
        activePipeline,
        openTx,
        goalPace !== null ? `${goalPace}%` : 'Goal not set',
        lastActive,
        status,
      ]);
    } catch (err) {
      console.error(`[Drive] Error getting data for agent ${agentId}:`, err);
    }
  }

  if (rows.length > 0) {
    await setSheetValues(at, rt, rollupSheetId, 'A2', rows);
  }

  const totalsRow: (string | number | null)[] = [
    `TOTALS (${rows.length} agents)`, '', '',
    rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r[3]) || 0), 0) / rows.length) : 0,
    rows.reduce((s, r) => s + (Number(r[4]) || 0), 0),
    rows.reduce((s, r) => s + (Number(r[5]) || 0), 0),
    rows.reduce((s, r) => s + (Number(r[6]) || 0), 0),
    rows.reduce((s, r) => s + (Number(r[7]) || 0), 0),
    rows.reduce((s, r) => s + (Number(r[8]) || 0), 0),
    '', `Updated: ${new Date().toLocaleString()}`, '',
  ];
  await setSheetValues(at, rt, rollupSheetId, `A${rows.length + 2}`, [totalsRow]);
}
