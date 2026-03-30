/**
 * PCx Sync Queue — Stub
 *
 * CURRENT STATE: All functions are no-ops (log only).
 * FUTURE STATE: Replace the console.log lines with actual PCx API calls
 * once API credentials and endpoint documentation are obtained.
 *
 * Trigger points (already wired — fire when relevant ASRE events occur):
 *   - Weekly pulse submitted      → syncPulseActivityToPCx()
 *   - Session notes saved         → syncSessionNotesToPCx()
 *   - Commitment marked complete  → syncCommitmentCompletionToPCx()
 *   - Deliverable completed       → syncDeliverableProgressToPCx()
 *
 * PERMANENT RULES:
 *   - Never sync an agent who hasn't explicitly set pcxSyncEnabled = true
 *   - Never auto-populate pcxAgentId — coach enters it manually in Settings
 *   - All functions must remain no-ops until PCX_API_KEY is set in Railway env vars
 */

import * as db from '../db';

// ── Guard: only proceed if PCx API key is configured ─────────────────────────

function isPCxLive(): boolean {
  return Boolean(process.env.PCX_API_KEY);
}

// ── Sync stubs ────────────────────────────────────────────────────────────────

export async function syncPulseActivityToPCx(userId: number): Promise<void> {
  const profile = await db.getAgentProfile(userId);
  if (!(profile as any)?.pcxSyncEnabled || !(profile as any)?.pcxAgentId) return;

  if (!isPCxLive()) {
    console.log(
      `[PCx Sync] Pulse activity ready for agent ${(profile as any).pcxAgentId} — API not yet live`
    );
    return;
  }

  // TODO: POST pulse activity to PCx API when credentials are available
  // const res = await fetch(`${PCX_API_BASE}/agents/${profile.pcxAgentId}/activity`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.PCX_API_KEY}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ... }),
  // });
}

export async function syncSessionNotesToPCx(
  sessionId: string,
  coachNotes: string
): Promise<void> {
  if (!isPCxLive()) {
    console.log(`[PCx Sync] Session notes ready for ${sessionId} — API not yet live`);
    return;
  }

  // TODO: POST session notes to PCx when API available
}

export async function syncCommitmentCompletionToPCx(
  commitmentId: string,
  userId: number
): Promise<void> {
  const profile = await db.getAgentProfile(userId);
  if (!(profile as any)?.pcxSyncEnabled || !(profile as any)?.pcxAgentId) return;

  if (!isPCxLive()) {
    console.log(
      `[PCx Sync] Commitment ${commitmentId} complete for agent ${(profile as any).pcxAgentId} — API not yet live`
    );
    return;
  }

  // TODO: PATCH commitment status to PCx when API available
}

export async function syncDeliverableProgressToPCx(
  userId: number,
  deliverableId: string
): Promise<void> {
  const profile = await db.getAgentProfile(userId);
  if (!(profile as any)?.pcxSyncEnabled || !(profile as any)?.pcxAgentId) return;

  if (!isPCxLive()) {
    console.log(
      `[PCx Sync] Deliverable ${deliverableId} complete for agent ${(profile as any).pcxAgentId} — API not yet live`
    );
    return;
  }

  // TODO: Push deliverable completion to PCx when API available
}
