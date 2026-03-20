import cron from 'node-cron';
import * as db from '../db';
import { refreshMCRollup } from './mcRollup';
import { appendSheetRow } from './googleDrive';

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
    try {
      const allUsers = await db.getUsersWithDriveTokens();
      const now = new Date();
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const currentMonth = new Date(prevYear, prevMonth, 1)
        .toLocaleString('default', { month: 'long', year: 'numeric' });

      for (const user of allUsers) {
        try {
          const [txList, financials, tokens] = await Promise.all([
            db.getUserTransactions(user.id),
            db.getUserFinancials(user.id),
            db.getDriveTokens(user.id),
          ]);

          if (!tokens?.sheetIds) continue;
          const sheetId = (tokens.sheetIds as Record<string, string>)['Commission Log'];
          if (!sheetId) continue;

          // Filter to previous month's closed transactions
          const monthlyClosings = txList.filter(t => {
            if (t.status !== 'closed') return false;
            const d = t.closeDate ? new Date(t.closeDate) : null;
            return d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
          });

          // Filter to previous month's expenses
          const monthlyExpenses = financials.filter(f => {
            if (f.type !== 'expense') return false;
            const d = new Date(f.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
          });

          const grossGci = monthlyClosings.reduce((s, t) => s + (t.commission ?? 0), 0);
          const totalExpenses = monthlyExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);
          const netIncome = grossGci - totalExpenses;
          const margin = grossGci > 0
            ? Math.round((netIncome / grossGci) * 100) + '%'
            : '0%';

          await appendSheetRow(
            tokens.accessToken,
            tokens.refreshToken,
            sheetId,
            'A:H',
            [
              currentMonth,
              monthlyClosings.length,
              grossGci,
              totalExpenses,
              netIncome,
              margin,
              '',
              'Monthly rollup — auto-generated',
            ]
          );
          console.log(`[Drive] P&L export complete for userId=${user.id} (${currentMonth})`);
        } catch (userErr) {
          console.error(`[Drive] P&L export failed for userId=${user.id}:`, userErr);
        }
      }
    } catch (err) {
      console.error('[Drive] Monthly P&L export failed:', err);
    }
  });

  console.log('[Drive] Scheduler started');
}
