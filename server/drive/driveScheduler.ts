import cron from 'node-cron';
import * as db from '../db';
import { refreshMCRollup } from './mcRollup';

export function startDriveScheduler(): void {
  // Refresh all MC rollup sheets every night at 2am
  cron.schedule('0 2 * * *', async () => {
    console.log('[Drive] Starting nightly MC rollup refresh...');
    try {
      const mcAccounts = await db.getMCAccounts();
      for (const mc of mcAccounts) {
        const agentIds = await db.getMCAgentIds(mc.userId);
        if (mc.rollupSheetId && agentIds.length > 0) {
          await refreshMCRollup(mc.userId, mc.rollupSheetId, agentIds);
          console.log(`[Drive] Refreshed MC rollup for userId=${mc.userId}`);
        }
      }
    } catch (err) {
      console.error('[Drive] Nightly rollup failed:', err);
    }
  });

  // Monthly P&L export on the 1st at 6am
  cron.schedule('0 6 1 * *', async () => {
    console.log('[Drive] Starting monthly P&L exports...');
    // TODO: Phase 7b — monthly financial export
  });

  console.log('[Drive] Scheduler started');
}
