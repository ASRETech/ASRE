/**
 * server/schedule/buckets.ts
 * Schedule bucket definitions for the Schedule Creator (Phase 10)
 */

export type BucketKey = 'leadgen' | 'deliverable' | 'wealth' | 'financial' | 'coaching' | 'deepwork' | 'admin' | 'blocked' | '';

export interface BucketMeta {
  key: BucketKey;
  label: string;
  color: string;
  shortcut: string;
  description: string;
}

export const BUCKET_METADATA: Record<string, BucketMeta> = {
  leadgen:     { key: 'leadgen',     label: 'Lead Gen',      color: '#ef4444', shortcut: '1', description: 'Prospecting, calls, follow-up' },
  deliverable: { key: 'deliverable', label: 'Deliverable',   color: '#f59e0b', shortcut: '2', description: 'MREA deliverables, business planning' },
  wealth:      { key: 'wealth',      label: 'Wealth',        color: '#10b981', shortcut: '3', description: 'Wealth milestones, investment research' },
  financial:   { key: 'financial',   label: 'Financial',     color: '#6366f1', shortcut: '4', description: 'Tax payments, CPA meetings, bookkeeping' },
  coaching:    { key: 'coaching',    label: 'Coaching',      color: '#8b5cf6', shortcut: '5', description: 'Coaching sessions, team meetings' },
  deepwork:    { key: 'deepwork',    label: 'Deep Work',     color: '#0ea5e9', shortcut: '6', description: 'Focused work, strategy, learning' },
  admin:       { key: 'admin',       label: 'Admin',         color: '#94a3b8', shortcut: '7', description: 'Email, admin tasks, errands' },
  blocked:     { key: 'blocked',     label: 'Blocked',       color: '#1e293b', shortcut: 'b', description: 'Personal time, unavailable' },
  '':          { key: '',            label: 'Empty',         color: 'transparent', shortcut: 'e', description: 'Clear slot' },
};

export const BUCKET_KEYS_ORDERED: BucketKey[] = [
  'leadgen', 'deliverable', 'wealth', 'financial', 'coaching', 'deepwork', 'admin', 'blocked', ''
];

// Maps calendar event types to schedule bucket keys
export const EVENT_TYPE_TO_BUCKET: Record<string, BucketKey> = {
  financial:      'financial',
  milestone:      'wealth',
  deliverable:    'deliverable',
  lead_gen_block: 'leadgen',
  pulse_reminder: 'deepwork',
};
