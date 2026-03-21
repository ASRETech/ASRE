/**
 * server/schedule/placementEngine.ts
 * Places events into preferred schedule windows based on user's 7×48 grid.
 * Falls back gracefully when no preferred window exists.
 */
import { format, addDays, nextMonday } from 'date-fns';
import { BUCKET_METADATA } from './buckets';

export interface PlacementResult {
  date: string;        // yyyy-MM-dd
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  isPreferredWindow: boolean;
  fallbackReason?: string;
}

interface TimeWindow {
  day: number;       // 0=Mon, 6=Sun
  slotStart: number;
  slotEnd: number;
  durationSlots: number;
}

function slotToTime(slot: number): string {
  const totalMinutes = slot * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function addMinutesToTime(startTime: string, minutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function findWindowsForBucket(grid: string[][], bucketKey: string, durationMinutes: number): TimeWindow[] {
  const slotsNeeded = Math.ceil(durationMinutes / 30);
  const windows: TimeWindow[] = [];

  for (let day = 0; day < 7; day++) {
    const daySlots = grid[day] ?? [];
    let runStart = -1;

    for (let slot = 0; slot <= 48; slot++) {
      const isMatch = slot < 48 && daySlots[slot] === bucketKey;
      if (isMatch && runStart === -1) runStart = slot;
      if (!isMatch && runStart !== -1) {
        const runLen = slot - runStart;
        if (runLen >= slotsNeeded) {
          windows.push({ day, slotStart: runStart, slotEnd: slot, durationSlots: runLen });
        }
        runStart = -1;
      }
    }
  }

  // Sort: earliest in week first
  windows.sort((a, b) => a.day * 48 + a.slotStart - (b.day * 48 + b.slotStart));
  return windows;
}

function dayOffsetToDate(dayOfWeek: number): string {
  // dayOfWeek: 0=Mon, 1=Tue, ..., 6=Sun
  const monday = nextMonday(new Date());
  const target = addDays(monday, dayOfWeek);
  return format(target, 'yyyy-MM-dd');
}

export async function getPlacementFor(
  ctx: any,
  userId: number,
  bucketKey: string,
  durationMinutes: number
): Promise<PlacementResult | null> {
  try {
    // Load user's schedule preferences
    const prefs = await ctx.db.query.schedulePreferences?.findFirst?.({
      where: (p: any, { eq }: any) => eq(p.userId, userId)
    });

    if (!prefs?.weeklyGrid) {
      // No schedule set — use sensible defaults
      return {
        date: format(nextMonday(new Date()), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: addMinutesToTime('09:00', durationMinutes),
        isPreferredWindow: false,
        fallbackReason: 'No schedule configured',
      };
    }

    const grid = prefs.weeklyGrid as string[][];
    const windows = findWindowsForBucket(grid, bucketKey, durationMinutes);

    if (windows.length === 0) {
      // No preferred window for this bucket — fall back to deepwork windows or 9am
      const deepworkWindows = findWindowsForBucket(grid, 'deepwork', durationMinutes);
      if (deepworkWindows.length > 0) {
        const w = deepworkWindows[0];
        const startTime = slotToTime(w.slotStart);
        return {
          date: dayOffsetToDate(w.day),
          startTime,
          endTime: addMinutesToTime(startTime, durationMinutes),
          isPreferredWindow: false,
          fallbackReason: `No ${BUCKET_METADATA[bucketKey]?.label ?? bucketKey} window — placed in Deep Work`,
        };
      }
      return {
        date: format(nextMonday(new Date()), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: addMinutesToTime('09:00', durationMinutes),
        isPreferredWindow: false,
        fallbackReason: `No preferred window for ${BUCKET_METADATA[bucketKey]?.label ?? bucketKey}`,
      };
    }

    // Use the first available preferred window
    const w = windows[0];
    const startTime = slotToTime(w.slotStart);
    return {
      date: dayOffsetToDate(w.day),
      startTime,
      endTime: addMinutesToTime(startTime, durationMinutes),
      isPreferredWindow: true,
    };
  } catch {
    return null;
  }
}

export function extractWindowRules(grid: string[][]): Array<{
  bucketKey: string;
  bucketLabel: string;
  bucketColor: string;
  day: number;
  dayName: string;
  startTime: string;
  endTime: string;
  hoursPerWindow: number;
}> {
  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const rules: ReturnType<typeof extractWindowRules> = [];

  for (let day = 0; day < 7; day++) {
    const daySlots = grid[day] ?? [];
    let runBucket = '', runStart = -1;

    for (let slot = 0; slot <= 48; slot++) {
      const b = slot < 48 ? daySlots[slot] : '';
      if (b !== runBucket) {
        if (runBucket && runBucket !== 'blocked' && runStart !== -1) {
          const meta = BUCKET_METADATA[runBucket];
          rules.push({
            bucketKey: runBucket,
            bucketLabel: meta?.label ?? runBucket,
            bucketColor: meta?.color ?? '#888',
            day,
            dayName: DAY_NAMES[day],
            startTime: slotToTime(runStart),
            endTime: slotToTime(slot),
            hoursPerWindow: (slot - runStart) * 0.5,
          });
        }
        runBucket = b;
        runStart = slot;
      }
    }
  }
  return rules;
}
