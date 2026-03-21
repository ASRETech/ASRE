import * as db from '../db';
import {
  setSheetValues,
  appendSheetRow,
  createSpreadsheet,
  createFolder,
  shareFile,
} from './googleDrive';

const SHEET_NAMES = [
  'Weekly Pulse — 2025',
  'Economic Model',
  'Annual Business Plan',
  '90-Day Sprint',
  'Pipeline Tracker',
  'Commission Log',
  'Financial Milestones',
] as const;

const SHEET_HEADERS: Record<string, string[]> = {
  'Weekly Pulse — 2025': [
    'Week Ending', 'Contacts Made', 'Appointments Set', 'Appointments Held',
    'Buyer Agreements', 'Listing Appointments', 'Listing Agreements',
    'Contracts Written', 'Closings', 'Notes',
  ],
  'Economic Model': ['Field', 'Value'],
  'Annual Business Plan': ['Section', 'Item', 'Goal', 'Status'],
  '90-Day Sprint': ['Sprint', 'Week', 'Focus Area', 'Target', 'Actual', '% Complete'],
  'Pipeline Tracker': [
    'Name', 'Source', 'Stage', 'Added Date', 'Est. Close', 'Property Value', 'Notes',
  ],
  'Commission Log': [
    'Date', 'Property Address', 'Sale Price', 'Commission Rate',
    'Gross Commission', 'Split %', 'Net Commission', 'Source',
  ],
  'Financial Milestones': ['Track', 'Milestone', 'Status', 'Completed Date', 'Notes'],
};

export async function provisionAgentFolder(
  userId: number,
  agentName: string,
  _agentEmail: string
): Promise<string> {
  const tokens = await db.getDriveTokens(userId);
  if (!tokens) throw new Error('No Drive tokens for user ' + userId);
  const { accessToken, refreshToken } = tokens;

  const rootId = await createFolder(accessToken, refreshToken, `AgentOS — ${agentName}`);
  const ssIds: Record<string, string> = {};

  for (const name of SHEET_NAMES) {
    ssIds[name] = await createSpreadsheet(accessToken, refreshToken, name, rootId);
    if (SHEET_HEADERS[name]) {
      await setSheetValues(accessToken, refreshToken, ssIds[name], 'A1', [SHEET_HEADERS[name]]);
    }
  }

  await db.saveDriveFolderIds(userId, rootId, ssIds);
  return rootId;
}

export async function syncWeeklyPulse(
  userId: number,
  pulse: {
    weekEnding: string;
    contactsMade: number;
    appointmentsSet: number;
    appointmentsHeld: number;
    buyerAgreements: number;
    listingAppointments: number;
    listingAgreements: number;
    contractsWritten: number;
    closings: number;
    notes?: string;
  }
): Promise<void> {
  const tokens = await db.getDriveTokens(userId);
  if (!tokens) return;
  const sheetIds = tokens.sheetIds as Record<string, string> | null;
  const sheetId = sheetIds?.['Weekly Pulse — 2025'];
  if (!sheetId) return;
  await appendSheetRow(tokens.accessToken, tokens.refreshToken, sheetId, 'A:J', [
    pulse.weekEnding, pulse.contactsMade, pulse.appointmentsSet,
    pulse.appointmentsHeld, pulse.buyerAgreements, pulse.listingAppointments,
    pulse.listingAgreements, pulse.contractsWritten, pulse.closings, pulse.notes ?? '',
  ]);
}

export async function syncEconomicModel(
  userId: number,
  model: Record<string, string | number>
): Promise<void> {
  const tokens = await db.getDriveTokens(userId);
  if (!tokens) return;
  const sheetIds = tokens.sheetIds as Record<string, string> | null;
  const sheetId = sheetIds?.['Economic Model'];
  if (!sheetId) return;
  const rows = Object.entries(model).map(([k, v]) => [k, v] as (string | number)[]);
  await setSheetValues(tokens.accessToken, tokens.refreshToken, sheetId, 'A2', rows);
}

export async function syncPipelineLead(
  userId: number,
  lead: {
    name: string;
    source: string;
    stage: string;
    addedDate: string;
    estClose?: string;
    propertyValue?: number;
    notes?: string;
  }
): Promise<void> {
  const tokens = await db.getDriveTokens(userId);
  if (!tokens) return;
  const sheetIds = tokens.sheetIds as Record<string, string> | null;
  const sheetId = sheetIds?.['Pipeline Tracker'];
  if (!sheetId) return;
  await appendSheetRow(tokens.accessToken, tokens.refreshToken, sheetId, 'A:G', [
    lead.name, lead.source, lead.stage, lead.addedDate,
    lead.estClose ?? '', lead.propertyValue ?? '', lead.notes ?? '',
  ]);
}

export async function syncWealthMilestone(
  userId: number,
  milestone: {
    milestoneKey: string;
    status: string;
    completedDate?: string;
    notes?: string;
  }
): Promise<void> {
  const tokens = await db.getDriveTokens(userId);
  if (!tokens) return;
  const sheetIds = tokens.sheetIds as Record<string, string> | null;
  const sheetId = sheetIds?.['Financial Milestones'];
  if (!sheetId) return;

  // Convert milestone key to display name: 't2_llc_formed' -> 'LLC Formed'
  const displayName = milestone.milestoneKey
    .replace(/^t\d_/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const trackNum = milestone.milestoneKey.match(/^t(\d)/)?.[1] ?? '?';
  const track = `Track ${trackNum}`;

  await appendSheetRow(tokens.accessToken, tokens.refreshToken, sheetId, 'A:E', [
    track,
    displayName,
    milestone.status,
    milestone.completedDate ?? '',
    milestone.notes ?? '',
  ]);
}

export async function grantCoachAccess(userId: number, coachEmail: string): Promise<void> {
  const tokens = await db.getDriveTokens(userId);
  if (!tokens?.rootFolderId) return;
  await shareFile(tokens.accessToken, tokens.refreshToken, tokens.rootFolderId, coachEmail, 'reader');
}
