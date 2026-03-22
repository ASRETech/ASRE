/**
 * server/calendar/eventGenerator.ts
 * Generates the event queue from 5 sources:
 * 1. Financial deadlines
 * 2. Wealth milestones (incomplete)
 * 3. MREA deliverables (current level)
 * 4. Lead gen blocks (from economic model)
 * 5. Weekly pulse reminder (recurring Friday)
 */
import { format, addDays, nextMonday, isMonday } from 'date-fns';
import { getPlacementFor, getBusySlots } from '../schedule/placementEngine';
import { EVENT_TYPE_TO_BUCKET } from '../schedule/buckets';
import { getGCalClient } from './gcal';

// ── FINANCIAL DEADLINES ──
export const FINANCIAL_DEADLINES: Array<{
  key: string;
  title: string;
  description: string;
  month: number;
  day: number;
  year_offset?: number;
  isRecurring: boolean;
  colorId: string;
  remindDays?: number;
  durationMinutes?: number;
}> = [
  {
    key: 'q1_est_tax',
    title: '💵 Q1 Estimated Tax Due — Federal + Ohio',
    description: 'Q1 estimated tax payment due. Covers January–March income. Pay at IRS EFTPS and Ohio Business Gateway.',
    month: 4, day: 15, isRecurring: true, colorId: '2', remindDays: 14,
  },
  {
    key: 'q2_est_tax',
    title: '💵 Q2 Estimated Tax Due — Federal + Ohio',
    description: 'Q2 estimated tax payment due. Covers April–May income.',
    month: 6, day: 15, isRecurring: true, colorId: '2', remindDays: 14,
  },
  {
    key: 'q3_est_tax',
    title: '💵 Q3 Estimated Tax Due — Federal + Ohio',
    description: 'Q3 estimated tax payment due. Covers June–August income.',
    month: 9, day: 15, isRecurring: true, colorId: '2', remindDays: 14,
  },
  {
    key: 'q4_est_tax',
    title: '💵 Q4 Estimated Tax Due — Federal + Ohio',
    description: 'Q4 estimated tax payment due. Covers September–December income.',
    month: 1, day: 15, year_offset: 1, isRecurring: true, colorId: '2', remindDays: 14,
  },
  {
    key: 'ira_contribution_deadline',
    title: '💚 IRA Contribution Deadline — Prior Tax Year',
    description: 'Last day to contribute to Roth IRA or Traditional IRA for the prior tax year. Max: $7,000 ($8,000 if 50+).',
    month: 4, day: 15, isRecurring: true, colorId: '5', remindDays: 21,
  },
  {
    key: 'sep_ira_funding_deadline',
    title: '📈 SEP-IRA Funding Deadline (prior year)',
    description: 'Last day to fund SEP-IRA for prior tax year. Maximum: $69,000 (2025). Do not miss this — it is your biggest legal tax deduction.',
    month: 4, day: 15, isRecurring: true, colorId: '5', remindDays: 30,
  },
  {
    key: 'annual_business_plan',
    title: '📊 Annual Business Planning Session — Book Now',
    description: 'Block time for Annual Business Plan review. Last year review, GCI goal setting, 4-1-1 update, marketing budget.',
    month: 11, day: 15, isRecurring: true, colorId: '9', remindDays: 7, durationMinutes: 180,
  },
  {
    key: 'scorp_salary_deadline',
    title: '⚖️ S-Corp Reasonable Salary — Review with CPA',
    description: 'Review S-Corp officer salary vs. distribution ratio with your CPA before year-end.',
    month: 11, day: 1, isRecurring: true, colorId: '6', remindDays: 7, durationMinutes: 60,
  },
];

// ── MREA DELIVERABLE MAP ──
export const MREA_DELIVERABLE_MAP: Record<string, {
  title: string;
  description: string;
  durationMinutes: number;
  colorId: string;
}> = {
  'l1_profile_setup': { title: '📋 ASRE: Complete Profile Setup', description: 'Set up your ASRE profile: income goal, current MREA level, contact rates.', durationMinutes: 30, colorId: '9' },
  'l1_foundation_checklist': { title: '🛡️ ASRE: Complete Foundation Wealth Checklist', description: 'Review Track 1 Foundation milestones in ASRE Wealth Journey.', durationMinutes: 60, colorId: '5' },
  'l2_economic_model': { title: '📊 ASRE: Build Your Economic Model', description: 'Complete your MREA Economic Model in ASRE. Know your Daily Number.', durationMinutes: 90, colorId: '9' },
  'l2_production_goals': { title: '🎯 ASRE: Set Income + Production Goals', description: 'Define your GCI goal, closings needed, avg commission, weekly contact goal.', durationMinutes: 60, colorId: '9' },
  'l2_first_pulse': { title: '📈 ASRE: Submit Your First Weekly Pulse', description: 'Log this week in ASRE: contacts, appointments, agreements, new leads.', durationMinutes: 20, colorId: '9' },
  'l3_411_plan': { title: '📋 ASRE: Build 4-1-1 Goal Alignment Plan', description: 'Create your 4-1-1 in ASRE: 1 annual goal → 4 monthly goals → 4 weekly activities.', durationMinutes: 90, colorId: '9' },
  'l3_90day_sprint': { title: '🏃 ASRE: Create Q2 90-Day Sprint Plan', description: 'Open Sprint Planner in ASRE. Set sprint GCI goal, closing target, weekly contact goal.', durationMinutes: 90, colorId: '9' },
  'l3_database_import': { title: '🗄️ ASRE: Import + Segment Full Database', description: 'Import all contacts into ASRE CRM. Segment: Met (sphere) vs Haven\'t Met.', durationMinutes: 120, colorId: '9' },
  'l3_lead_gen_system': { title: '📞 Define Your 3 Primary Lead Gen Channels', description: 'Choose your 3 core lead sources. Set weekly activity targets for each.', durationMinutes: 60, colorId: '9' },
  'l4_annual_business_plan': { title: '📅 ASRE: Annual Business Plan', description: 'Work on Annual Business Plan in ASRE. Last year review, 2025 goals, marketing budget.', durationMinutes: 90, colorId: '9' },
  'l4_marketing_budget': { title: '💰 Set Marketing Budget (MREA: 10% of GCI)', description: 'Define your marketing budget in ASRE. MREA target: 10% of GCI.', durationMinutes: 60, colorId: '9' },
  'l4_first_hire_plan': { title: '👥 Plan Your First Team Hire', description: 'Define your first hire: role, trigger production level, KPA profile.', durationMinutes: 90, colorId: '9' },
  'l5_team_systems': { title: '⚙️ Build Team Accountability Systems', description: 'Define team activity standards, weekly meeting cadence, scorecards.', durationMinutes: 60, colorId: '9' },
  'l5_rainmaker_extraction': { title: '🎯 Rainmaker Extraction Plan', description: 'Map every function you currently own. Decide: keep or delegate.', durationMinutes: 120, colorId: '9' },
};

// ── WEALTH MILESTONE MAP ──
export const WEALTH_MILESTONE_MAP: Record<string, {
  title: string;
  description: string;
  durationMinutes: number;
  colorId: string;
  urgencyDays?: number;
  remindDaysBefore?: number;
}> = {
  't1_business_checking': { title: '🏦 Open Business Checking Account', description: 'Open dedicated business checking account.', durationMinutes: 30, colorId: '5' },
  't1_emergency_fund_3mo': { title: '💰 Build 3-Month Emergency Fund', description: 'Open a high-yield savings account. Target: 3× monthly personal expenses.', durationMinutes: 30, colorId: '5' },
  't1_basic_will': { title: '⚖️ Complete Basic Will + Advance Directive', description: 'Complete basic will at LegalZoom.com (~$99). If you have dependents, do this TODAY.', durationMinutes: 45, colorId: '5', urgencyDays: 7 },
  't2_llc_formed': { title: '🏗️ Form Ohio LLC — sos.state.oh.us ($99)', description: 'File Ohio LLC at secretary of state website. Fee: $99.', durationMinutes: 60, colorId: '5', urgencyDays: 14 },
  't2_scorp_2553': { title: '⚠️ FILE IRS Form 2553 — S-Corp Election', description: 'HIGHEST ROI MOVE: File Form 2553. Potential savings: $14-22K/year.', durationMinutes: 120, colorId: '11', urgencyDays: 7, remindDaysBefore: 14 },
  't2_cpa_hired': { title: '👨‍💼 Hire CPA — Self-Employed RE Specialist', description: 'Interview 2-3 CPAs who specialize in self-employed real estate agents.', durationMinutes: 60, colorId: '5' },
  't3_sep_ira': { title: '📈 Open SEP-IRA at Fidelity/Vanguard', description: 'Open SEP-IRA online. Contribution max 2025: $69,000.', durationMinutes: 60, colorId: '5', urgencyDays: 21 },
  't3_roth_ira': { title: '💹 Open Roth IRA (or Backdoor Roth)', description: 'Open Roth IRA at Fidelity/Vanguard. 2025 limit: $7,000.', durationMinutes: 45, colorId: '5' },
  't4_fi_number_defined': { title: '🎯 Set Your FI Number in ASRE', description: 'Open ASRE FI Calculator. FI Number = annual expenses × 25.', durationMinutes: 45, colorId: '5' },
  't4_term_life_insurance': { title: '🛡️ Get Term Life Insurance Quotes', description: 'Compare quotes at Policygenius.com. Target: 10-12× annual income, 20-year term.', durationMinutes: 45, colorId: '5' },
};

// ── GENERATE QUEUE FOR A USER ──
export async function generateEventQueue(ctx: any, userId: number): Promise<any[]> {
  const events: any[] = [];
  const today = new Date();
  const year = today.getFullYear();

  // MED-01: Batch-fetch busy slots once instead of per-event GCal calls
  // This prevents N+1 GCal API calls when generating a large queue
  let busySlots = new Set<string>();
  try {
    const gcalSettings = await ctx.db.query.calendarSettings?.findFirst?.({ where: (s: any, { eq }: any) => eq(s.userId, userId) });
    if (gcalSettings?.gcalAccessToken) {
      const auth = getGCalClient(gcalSettings.gcalAccessToken, gcalSettings.gcalRefreshToken ?? undefined);
      const weekStart = isMonday(today) ? addDays(today, 7) : nextMonday(today);
      busySlots = await getBusySlots(auth, gcalSettings.gcalCalendarId ?? 'primary', weekStart);
    }
  } catch { /* non-blocking — queue generation continues without busy data */ }

  // Helper to get placement from schedule engine (MED-01: passes busySlots to avoid N+1 GCal calls)
  const getPlacement = async (eventType: string, durationMinutes: number) => {
    try {
      const bucketKey = EVENT_TYPE_TO_BUCKET[eventType as keyof typeof EVENT_TYPE_TO_BUCKET] ?? 'deepwork';
      return await getPlacementFor(ctx, userId, bucketKey, durationMinutes, busySlots);
    } catch {
      return null;
    }
  };

  // HIGH-03: Helper to get next occurrence of a deadline (handles year boundary)
  const getNextDeadlineDate = (month: number, day: number, yearOffset?: number): Date => {
    if (yearOffset) return new Date(year + yearOffset, month - 1, day);
    const thisYear = new Date(year, month - 1, day);
    // If deadline already passed this year, schedule for next year
    return thisYear > today ? thisYear : new Date(year + 1, month - 1, day);
  };

  // HIGH-05: Safe nextMonday that handles when today IS Monday
  const safeNextMonday = (d: Date): Date => isMonday(d) ? addDays(d, 7) : nextMonday(d);

  // 1. FINANCIAL DEADLINES
  for (const fd of FINANCIAL_DEADLINES) {
    const deadlineDate = getNextDeadlineDate(fd.month, fd.day, fd.year_offset);
    const targetYear = deadlineDate.getFullYear();
    if (deadlineDate > today) {
      const placement = await getPlacement('financial', fd.durationMinutes ?? 0);
      events.push({
        userId,
        eventType: 'financial',
        sourceType: 'financial_calendar',
        sourceKey: `${fd.key}_${targetYear}`,
        title: fd.title,
        description: fd.description,
        suggestedDate: placement?.date ?? format(deadlineDate, 'yyyy-MM-dd'),
        suggestedStartTime: placement?.startTime ?? '09:00', // HIGH-04: never null for timed events
        durationMinutes: fd.durationMinutes ?? 0,
        isRecurring: fd.isRecurring,
        gcalColorId: fd.colorId,
        remindMinutesBefore: fd.remindDays ? fd.remindDays * 24 * 60 : 60,
        isPreferredWindow: placement?.isPreferredWindow ?? false,
        fallbackReason: placement?.fallbackReason ?? null,
        status: 'pending',
      });
    }
  }

  // 2. WEALTH MILESTONES — generate events for incomplete milestones
  try {
    const doneMilestones = await ctx.db.query.wealthMilestones?.findMany?.({
      where: (m: any, { eq, and }: any) => and(eq(m.userId, userId), eq(m.status, 'done'))
    }) ?? [];
    const doneKeys = new Set(doneMilestones.map((m: any) => m.milestoneKey));

    for (const [key, def] of Object.entries(WEALTH_MILESTONE_MAP)) {
      if (!doneKeys.has(key)) {
        const placement = await getPlacement('milestone', def.durationMinutes);
        const suggestedDate = def.urgencyDays
          ? format(addDays(today, def.urgencyDays), 'yyyy-MM-dd')
          : placement?.date ?? format(safeNextMonday(today), 'yyyy-MM-dd');
        events.push({
          userId,
          eventType: 'milestone',
          sourceType: 'wealth_milestone',
          sourceKey: key,
          title: def.title,
          description: def.description,
          suggestedDate,
          suggestedStartTime: placement?.startTime ?? '09:00', // HIGH-04: never null
          durationMinutes: def.durationMinutes,
          isRecurring: false,
          gcalColorId: def.colorId,
          remindMinutesBefore: (def.remindDaysBefore ?? 1) * 24 * 60,
          isPreferredWindow: placement?.isPreferredWindow ?? false,
          fallbackReason: placement?.fallbackReason ?? null,
          status: 'pending',
        });
      }
    }
  } catch { /* skip if table not ready */ }

  // 3. MREA DELIVERABLES — generate events for current level deliverables
  try {
    const profile = await ctx.db.query.agentProfiles?.findFirst?.({
      where: (p: any, { eq }: any) => eq(p.userId, userId)
    });
    const currentLevel = profile?.currentLevel ?? 1;
    const levelPrefix = `l${currentLevel}_`;
    for (const [key, def] of Object.entries(MREA_DELIVERABLE_MAP)) {
      if (key.startsWith(levelPrefix)) {
        const placement = await getPlacement('deliverable', def.durationMinutes);
        events.push({
          userId,
          eventType: 'deliverable',
          sourceType: 'mrea_deliverable',
          sourceKey: key,
          title: def.title,
          description: def.description,
          suggestedDate: placement?.date ?? format(safeNextMonday(today), 'yyyy-MM-dd'),
          suggestedStartTime: placement?.startTime ?? '09:00', // HIGH-04: never null
          durationMinutes: def.durationMinutes,
          isRecurring: false,
          gcalColorId: def.colorId,
          remindMinutesBefore: 30,
          isPreferredWindow: placement?.isPreferredWindow ?? false,
          fallbackReason: placement?.fallbackReason ?? null,
          status: 'pending',
        });
      }
    }
  } catch { /* skip if table not ready */ }

  // 4. LEAD GEN BLOCKS — recurring, based on daily number
  try {
    const settings = await ctx.db.query.calendarSettings?.findFirst?.({
      where: (s: any, { eq }: any) => eq(s.userId, userId)
    });
    const economicModel = await ctx.db.query.economicModel?.findFirst?.({
      where: (m: any, { eq }: any) => eq(m.userId, userId)
    });
    if (economicModel?.dailyContactsNeeded && settings?.leadGenEnabled !== false) {
      const dailyNumber = parseFloat(economicModel.dailyContactsNeeded);
      // CRIT-05: Guard against division by zero
      const contactsPerHrRaw = parseFloat(settings?.contactsPerHour ?? '2');
      const contactsPerHr = contactsPerHrRaw > 0 ? contactsPerHrRaw : 2;
      const hrsPerDay = Math.ceil((dailyNumber / contactsPerHr) * 10) / 10;
      const minutesPerDay = Math.max(30, Math.ceil(hrsPerDay * 60)); // minimum 30 min block
      const days = (settings?.leadGenDays ?? 'MO,TU,WE,TH,FR').split(',');
      // HIGH-02: Validate RRULE days — only allow valid iCal day codes
      const VALID_DAYS = new Set(['MO','TU','WE','TH','FR','SA','SU']);
      const validDays = days.filter((d: string) => VALID_DAYS.has(d.trim().toUpperCase()));
      const rruleDays = validDays.length > 0 ? validDays.join(',') : 'MO,TU,WE,TH,FR';
      events.push({
        userId,
        eventType: 'lead_gen_block',
        sourceType: 'economic_model',
        sourceKey: 'lead_gen_recurring',
        title: `📞 Lead Gen Block — ${dailyNumber} contacts`,
        description: `Daily lead generation block. Target: ${dailyNumber} contacts at ${contactsPerHr} contacts/hour = ${hrsPerDay} hours.`,
        suggestedDate: format(safeNextMonday(today), 'yyyy-MM-dd'), // HIGH-05
        suggestedStartTime: settings?.leadGenStartTime ?? '07:00',
        durationMinutes: minutesPerDay,
        isRecurring: true,
        recurrenceRule: `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays};COUNT=52`, // HIGH-02: bounded recurrence
        gcalColorId: '11',
        remindMinutesBefore: 10,
        isPreferredWindow: true,
        fallbackReason: null,
        status: 'pending',
      });
    }
  } catch { /* skip if table not ready */ }

  // 5. WEEKLY PULSE REMINDER — recurring Friday
  events.push({
    userId,
    eventType: 'pulse_reminder',
    sourceType: 'recurring_system',
    sourceKey: 'weekly_pulse_friday',
    title: '📊 Submit Weekly Pulse in ASRE',
    description: 'Log this week\'s activity in ASRE: contacts, appointments, agreements, listings, closings. Takes ~15 minutes.',
    suggestedDate: format(today, 'yyyy-MM-dd'),
    suggestedStartTime: '17:00',
    durationMinutes: 20,
    isRecurring: true,
    recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=FR',
    gcalColorId: '9',
    remindMinutesBefore: 30,
    isPreferredWindow: true,
    fallbackReason: null,
    status: 'pending',
  });

  return events;
}
