/**
 * server/schedule/templates.ts
 * Pre-built schedule templates for the Schedule Creator
 * Slots: 0=midnight (12am), each slot = 30 min
 * Slot 14=7am, 16=8am, 18=9am, 19=9:30am, 20=10am, 24=12pm, 26=1pm, 28=2pm, 34=5pm
 */

export const MREA_TEMPLATE: string[][] = (() => {
  const grid: string[][] = Array.from({ length: 7 }, () => Array(48).fill(''));

  const set = (day: number, from: number, to: number, bucket: string) => {
    for (let s = from; s < to; s++) grid[day][s] = bucket;
  };

  // MONDAY (0)
  set(0, 14, 19, 'leadgen');     // 7:00–9:30am
  set(0, 20, 24, 'deepwork');    // 10:00am–12:00pm

  // TUESDAY (1)
  set(1, 14, 19, 'leadgen');     // 7:00–9:30am
  set(1, 19, 24, 'deliverable'); // 9:30am–12:00pm
  set(1, 25, 26, 'coaching');    // 12:30pm
  set(1, 26, 30, 'coaching');    // 1:00–3:00pm

  // WEDNESDAY (2)
  set(2, 14, 19, 'leadgen');     // 7:00–9:30am
  set(2, 20, 24, 'deepwork');    // 10:00am–12:00pm

  // THURSDAY (3)
  set(3, 18, 22, 'deliverable'); // 9:00–11:00am
  set(3, 26, 32, 'leadgen');     // 1:00–3:30pm

  // FRIDAY (4)
  set(4, 14, 19, 'leadgen');     // 7:00–9:30am
  set(4, 19, 22, 'financial');   // 9:30–11:00am
  set(4, 26, 33, 'wealth');      // 1:00–4:30pm
  set(4, 34, 35, 'deepwork');    // 5:00–5:30pm (pulse)

  // Saturday (5) and Sunday (6) — left empty

  return grid;
})();

export const CLEAR_TEMPLATE: string[][] = Array.from({ length: 7 }, () => Array(48).fill(''));

export function getTemplate(name: string): string[][] {
  switch (name) {
    case 'mrea': return MREA_TEMPLATE.map(row => [...row]);
    case 'clear': return CLEAR_TEMPLATE.map(row => [...row]);
    default: return CLEAR_TEMPLATE.map(row => [...row]);
  }
}
