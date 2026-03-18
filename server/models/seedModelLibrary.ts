import { getDb } from '../db';
import { modelLibrary } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const KW_MODELS = [
  // ── MREA Core Models ─────────────────────────────────────────
  {
    modelId: 'economic-model',
    title: 'The Economic Model',
    category: 'mrea_core' as const,
    summary: 'Reverse-engineer your income goal into daily activity by working backwards from net income through GCI, units, conversion rates, and contacts required.',
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['lead-generation-model', 'budget-model', '4-1-1'],
    sortOrder: 1,
    content: {
      keyQuestion: 'How many contacts do I need to make today to hit my annual income goal?',
      formula: [
        { step: 1, label: 'Net Income Goal', description: 'What do you want to take home after taxes and expenses?' },
        { step: 2, label: 'Gross Income Needed', description: 'Divide net goal by (1 - tax rate - expense ratio). KW benchmark: 25% taxes, 15% expenses.' },
        { step: 3, label: 'GCI Required', description: 'Your gross commission income before splits. Account for your brokerage split.' },
        { step: 4, label: 'Units Needed', description: 'GCI ÷ average GCI per transaction.' },
        { step: 5, label: 'Appointments Needed', description: 'Units ÷ closing rate. If 30% of appointments close, multiply units by 3.3.' },
        { step: 6, label: 'Contacts Required', description: 'Appointments ÷ conversion rate. If 10% of contacts turn into appointments, multiply by 10.' },
        { step: 7, label: 'Daily Activity', description: 'Contacts required ÷ 250 working days = contacts per day.' },
      ],
      kwBenchmarks: { expenseRatio: 0.15, taxRate: 0.25, avgAppointmentCloseRate: 0.30, avgContactToAppointmentRate: 0.10 },
      millerQuote: "The Economic Model is the most important model in real estate. Without it, you're hoping. With it, you're planning.",
    },
  },
  {
    modelId: 'lead-generation-model',
    title: 'The Lead Generation Model',
    category: 'mrea_core' as const,
    summary: "The three-part system for generating leads: your Met database (people you know), your Haven't Met database (marketing), and your team's lead generation efforts.",
    relevantLevels: [1, 2, 3, 4, 5],
    relatedModels: ['36-12-3', '8x8', '33-touch', '12-direct'],
    sortOrder: 2,
    content: {
      keyQuestion: 'Where are my next 10 transactions coming from?',
      threeSourceModel: [
        { source: 'Met Database (Sphere)', description: 'Everyone you know personally. Managed with 33 Touch.', expectedReturn: '3 transactions per year per 100 people when maintained at 33 Touch cadence.', programs: ['33-touch', '8x8'] },
        { source: "Haven't Met (Marketing)", description: "People who don't know you yet. Reached through advertising, content, and direct response.", expectedReturn: 'Lower conversion, higher volume. Supplements sphere production.', programs: ['12-direct'] },
        { source: 'Team Lead Generation', description: 'Systematic, role-specific lead generation at Level 4+. BAs have their own lead gen targets.', expectedReturn: 'Scales with team size and accountability.', programs: ['4-1-1'] },
      ],
    },
  },
  {
    modelId: 'budget-model',
    title: 'The Budget Model',
    category: 'mrea_core' as const,
    summary: "MREA's recommended expense ratios for a sustainable real estate business: 15% expenses, 10% savings, 25% taxes — leaving 50% as actual take-home income.",
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['economic-model', 'profit-first'],
    sortOrder: 3,
    content: {
      keyQuestion: 'Is my business financially sustainable at scale?',
      ratios: [
        { category: 'Taxes (set aside)', target: 0.25, description: 'Federal, state, self-employment. Pay quarterly.' },
        { category: 'Savings (personal)', target: 0.10, description: 'Pay yourself first. Non-negotiable.' },
        { category: 'Business expenses', target: 0.15, description: 'Marketing, tech, coaching, admin. Cap here.' },
        { category: 'Net take-home', target: 0.50, description: 'What remains after the above three. Your actual income.' },
      ],
      redFlags: [
        'Business expenses above 20% of GCI signal a model problem, not a market problem.',
        'Teams with staffing costs above 30% of GCI before systems are in place rarely survive a down market.',
      ],
    },
  },
  {
    modelId: 'organizational-model',
    title: 'The Organizational Model',
    category: 'mrea_core' as const,
    summary: "MREA's framework for building a team: Talent → Training → Systems → Accountability. Every hire and every team management decision should flow through this sequence.",
    relevantLevels: [2, 3, 4, 5, 6, 7],
    relatedModels: ['gwc', 'talent-triangle', 'ttsa', 'career-visioning'],
    sortOrder: 4,
    content: {
      keyQuestion: 'Do I have the right people doing the right things in the right way?',
      ttsa: [
        { element: 'Talent', question: 'Do they have the natural ability for this role?', diagnostic: "Could you train 1,000 people to do this? If yes, it's skill. If no, it's talent. You can't train talent." },
        { element: 'Training', question: 'Do they have the specific knowledge and skills this role requires?', diagnostic: "What's their current training status? What's their next development milestone?" },
        { element: 'Systems', question: 'Are there documented systems in place for what they do?', diagnostic: 'If they left tomorrow, could someone follow a written process and produce the same result?' },
        { element: 'Accountability', question: 'Are they held to clear metrics and given feedback when they miss?', diagnostic: 'Does this person have a scorecard? Do they know their targets? When did they last receive feedback?' },
      ],
    },
  },
  {
    modelId: 'three-ls',
    title: "The Three L's — Listings, Leverage, Leads",
    category: 'mrea_core' as const,
    summary: 'The core thesis of the Millionaire Real Estate Agent: Listings create leverage because they generate buyer leads, establish market presence, and work while you sleep.',
    relevantLevels: [3, 4, 5, 6, 7],
    relatedModels: ['economic-model', 'lead-generation-model', 'organizational-model'],
    sortOrder: 5,
    content: {
      keyQuestion: 'Is my business built on leverage or on hustle?',
      framework: [
        { l: 'Listings', why: "A listing markets itself. It generates buyer leads, creates neighborhood credibility, and doesn't require your personal time after the sign goes up.", howToMeasure: 'Track listing-to-buyer lead conversion ratio monthly.' },
        { l: 'Leverage', why: "Every task someone else can do is a task that frees you to do what only you can do. Hire to your weaknesses. Delegate to systems first, then people.", howToMeasure: 'Track what percentage of your week is spent on Dollar Productive Activities (DPAs) vs. administration.' },
        { l: 'Leads', why: 'Without a systematic approach to lead generation, growth is random. With one, it\'s predictable.', howToMeasure: 'Track contacts made weekly against the Economic Model target.' },
      ],
    },
  },
  // ── Goal-Setting Models ──────────────────────────────────────
  {
    modelId: '4-1-1',
    title: 'The 4-1-1',
    category: 'goal_setting' as const,
    summary: 'A goal-setting framework that aligns annual goals to monthly milestones to weekly activities. Named for the structure: 4 weekly items, 1 monthly goal, 1 annual goal.',
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['gps', 'economic-model', 'one-thing'],
    sortOrder: 10,
    content: {
      keyQuestion: "Is what I'm doing this week actually connected to my annual goal?",
      structure: [
        { level: 'Annual', description: 'One big goal for the year. Should connect directly to the Economic Model output.' },
        { level: 'Monthly', description: 'The milestone that keeps the annual goal on track. Reviewed at month start.' },
        { level: 'Weekly (×4)', description: 'Four specific activities this week that move the monthly milestone forward. Set Monday morning.' },
      ],
      kwBenchmarkActivities: ['Contacts made', 'Appointments set', 'Appointments kept', 'Agreements signed', 'Transactions under contract', 'Transactions closed'],
    },
  },
  {
    modelId: 'gps',
    title: 'GPS — Goals, Priorities, Strategies',
    category: 'goal_setting' as const,
    summary: "KW's quarterly planning framework. One goal, three priorities that achieve it, three strategies under each priority. Reviewed at the start of every quarter.",
    relevantLevels: [2, 3, 4, 5, 6, 7],
    relatedModels: ['4-1-1', 'one-thing', 'bold-goal'],
    sortOrder: 11,
    content: {
      keyQuestion: "What are the three things I need to accomplish this quarter to hit my annual goal?",
      structure: [
        { element: 'Goal', description: 'One specific, measurable quarterly goal. Connected to the annual goal.' },
        { element: 'Priority 1', description: 'The most important area of focus. Three specific strategies sit underneath it.' },
        { element: 'Priority 2', description: 'Second area of focus. Three strategies.' },
        { element: 'Priority 3', description: 'Third area of focus. Three strategies.' },
      ],
      reviewCadence: 'Set at quarter start. Review mid-quarter. Assess at quarter close.',
      coachingUse: 'Every coaching session should reference the current GPS plan. Hot seats are almost always a GPS execution problem.',
    },
  },
  {
    modelId: 'one-thing',
    title: 'The One Thing',
    category: 'goal_setting' as const,
    summary: "Gary Keller's focusing question: \"What's the one thing I can do such that by doing it, everything else will be easier or unnecessary?\" Applied at annual, monthly, weekly, and daily levels.",
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['gps', '4-1-1'],
    sortOrder: 12,
    content: {
      focusingQuestion: "What's the ONE Thing I can do such that by doing it everything else will be easier or unnecessary?",
      levels: [
        { level: 'Annual', prompt: 'For my career this year, what\'s the one thing...' },
        { level: 'Monthly', prompt: 'For my business this month, what\'s the one thing...' },
        { level: 'Weekly', prompt: 'This week, to stay on track, what\'s the one thing...' },
        { level: 'Daily', prompt: 'Today, my most important priority is...' },
      ],
      timeBlock: 'The One Thing should be completed during protected time before checking email or messages. Minimum 4 hours.',
    },
  },
  {
    modelId: 'bold-goal',
    title: 'BOLD Goal Setting',
    category: 'goal_setting' as const,
    summary: "From KW's BOLD program: a goal big enough to be uncomfortable, specific enough to be measurable, and meaningful enough to survive obstacles.",
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['gps', 'one-thing', '4-1-1'],
    sortOrder: 13,
    content: {
      boldCriteria: [
        { criterion: 'Business Objective', description: 'Tied to a specific production or business building outcome.' },
        { criterion: 'A Life By Design', description: "Connected to what you're building the business for — not just a revenue number." },
        { criterion: 'Specific and Measurable', description: 'You know exactly whether you achieved it by December 31.' },
        { criterion: 'Uncomfortable', description: "If it doesn't scare you a little, it's not BOLD enough." },
      ],
    },
  },
  // ── Lead Generation Programs ──────────────────────────────────
  {
    modelId: '36-12-3',
    title: '36:12:3 — The Database Formula',
    category: 'lead_generation' as const,
    summary: 'The KW formula for sphere of influence production: contact everyone in your Met database 36 times per year, send 12 direct marketing pieces, and expect 3 transactions per 100 people.',
    relevantLevels: [1, 2, 3, 4, 5],
    relatedModels: ['33-touch', '8x8', 'lead-generation-model'],
    sortOrder: 20,
    content: {
      formula: { contacts: 36, direct: 12, transactionsPerHundred: 3 },
      context: 'Industry average for agents NOT working their database is 0.5–1 transaction per 100 people. KW agents working the 36:12:3 system average 3. The difference is entirely systematic contact.',
    },
  },
  {
    modelId: '8x8',
    title: '8x8 — New Contact Conversion Program',
    category: 'lead_generation' as const,
    summary: "8 meaningful touches in 8 weeks to convert a new contact from Haven't Met to Met status. The entry ramp into the long-term relationship system.",
    relevantLevels: [1, 2, 3, 4],
    relatedModels: ['33-touch', '36-12-3'],
    sortOrder: 21,
    content: {
      structure: [
        { week: 1, touch: 'Personal handwritten note + market report', type: 'mail' },
        { week: 2, touch: 'Phone call — introduce yourself, ask about their timeline', type: 'call' },
        { week: 3, touch: 'Email with a relevant article or market update', type: 'email' },
        { week: 4, touch: 'Pop-by or drop-off (if local) — small branded item', type: 'in-person' },
        { week: 5, touch: 'Email with a neighborhood-specific report', type: 'email' },
        { week: 6, touch: 'Phone call — follow up on their situation', type: 'call' },
        { week: 7, touch: 'Personal note — acknowledge something specific about them', type: 'mail' },
        { week: 8, touch: 'Phone call — invite to an event or offer a consultation', type: 'call' },
      ],
      goal: 'By week 8, the contact should know who you are, trust that you know your market, and feel a genuine relationship beginning. After 8x8, they move into 33 Touch.',
    },
  },
  {
    modelId: '33-touch',
    title: '33 Touch — Annual Relationship Maintenance',
    category: 'lead_generation' as const,
    summary: '33 pre-planned touches per year with every person in your Met database. The system that produces the 36:12:3 results.',
    relevantLevels: [1, 2, 3, 4, 5],
    relatedModels: ['8x8', '36-12-3', '12-direct'],
    sortOrder: 22,
    content: {
      annualPlan: [
        { type: 'E-cards / newsletters', count: 14, description: 'Market updates, home tips, seasonal content.' },
        { type: 'Phone calls', count: 8, description: 'Personal, conversational, not salesy. Holidays, birthdays, anniversaries.' },
        { type: 'Personal notes', count: 3, description: 'Handwritten. Reference something specific to them.' },
        { type: 'Pop-bys', count: 4, description: 'Brief in-person visits with a small gift or value item.' },
        { type: 'Events', count: 2, description: 'Client appreciation events. They bring referrals.' },
        { type: 'Customer appreciation', count: 1, description: 'Annual larger event. Top clients only.' },
        { type: 'Direct mail', count: 1, description: 'The 12 Direct piece that goes to the full list.' },
      ],
      total: 33,
    },
  },
  {
    modelId: '12-direct',
    title: '12 Direct — Annual Marketing Program',
    category: 'lead_generation' as const,
    summary: '12 direct marketing pieces sent to your entire database annually — one per month. Creates consistent market presence even with people you haven\'t spoken to.',
    relevantLevels: [2, 3, 4, 5, 6],
    relatedModels: ['33-touch', '36-12-3'],
    sortOrder: 23,
    content: {
      monthlyThemes: [
        { month: 'January', theme: 'Year in review + predictions' },
        { month: 'February', theme: "Market report + Valentine's" },
        { month: 'March', theme: 'Spring buying season preview' },
        { month: 'April', theme: 'Neighborhood spotlight' },
        { month: 'May', theme: 'Seller tips — spring market peak' },
        { month: 'June', theme: 'Summer market update' },
        { month: 'July', theme: 'Home maintenance checklist' },
        { month: 'August', theme: 'Back to school — neighborhood guide' },
        { month: 'September', theme: 'Fall market preview' },
        { month: 'October', theme: 'Investment property market update' },
        { month: 'November', theme: 'Gratitude — client appreciation' },
        { month: 'December', theme: 'Year-end tax tips + holiday' },
      ],
    },
  },
  // ── Business Philosophy Models ────────────────────────────────
  {
    modelId: 'belief-model',
    title: 'The Belief Model',
    category: 'business_philosophy' as const,
    summary: 'Beliefs drive Actions which drive Results. When production is down, the root cause is almost always a belief problem, not a skill or market problem.',
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['accountability-ladder', 'perspective-model'],
    sortOrder: 30,
    content: {
      framework: 'Beliefs → Actions → Results',
      diagnostic: [
        { question: 'Is the agent taking the right actions?', ifNo: "Belief problem. They don't believe the action will produce results, so they don't do it consistently." },
        { question: 'Are they taking actions but not getting results?', ifYes: "Skills or knowledge problem. They believe and they do — but they don't know how to do it well yet." },
        { question: 'Are results inconsistent despite consistent action?', ifYes: 'Market or model problem. Look at the Economic Model ratios.' },
      ],
      coachingApplication: "When an agent says \"the market is bad\" or \"my leads aren't good,\" run this diagnostic before accepting the explanation. Most production problems are belief problems in disguise.",
    },
  },
  {
    modelId: 'perspective-model',
    title: 'The Perspective Model',
    category: 'business_philosophy' as const,
    summary: '"It\'s not the market — it\'s your model." In any market condition, agents with the right economic model, lead generation model, and organizational model outperform.',
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['belief-model', 'economic-model', 'lead-generation-model'],
    sortOrder: 31,
    content: {
      kwMantra: "It's not the market. It's your model.",
      application: "When a down market is flagged, AgentOS surfaces a model review rather than a market assessment. The three questions: Is your Economic Model still accurate? Is your Lead Generation consistent? Is your team Organized for this market?",
      millerContext: "KW agents who survived 2008 weren't lucky. They had better models. The market downturn filtered out agents who were riding the market versus agents who were running a business.",
    },
  },
  {
    modelId: 'wi4c2ts',
    title: 'WI4C2TS — KW Core Values',
    category: 'business_philosophy' as const,
    summary: 'Win-Win, Integrity, Customers, Commitment, Communication, Creativity, Teamwork, Success. The values framework KW agents use to make decisions and build culture.',
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['win-win', 'culture-os'],
    sortOrder: 32,
    content: {
      values: [
        { value: 'Win-Win', description: 'Or No Deal. Every transaction should serve both parties genuinely.' },
        { value: 'Integrity', description: 'Do the right thing even when no one is watching. Non-negotiable.' },
        { value: 'Customers', description: 'Always come first. Their needs define your priorities.' },
        { value: 'Commitment', description: 'In all things. To your clients, your team, and your model.' },
        { value: 'Communication', description: 'Seek first to understand. Communicate proactively.' },
        { value: 'Creativity', description: 'Solutions focus. When the obvious path is blocked, find another.' },
        { value: 'Teamwork', description: 'Together Everyone Achieves More. Even solo agents have a team.' },
        { value: 'Success', description: 'Results through people. A business that doesn\'t produce results isn\'t fulfilling its mission.' },
      ],
    },
  },
  {
    modelId: 'win-win',
    title: 'Win-Win or No Deal',
    category: 'business_philosophy' as const,
    summary: "KW's foundational business ethics position: a transaction where one party loses isn't a win — it's a liability. The long-term cost of a bad deal always exceeds the short-term commission.",
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['wi4c2ts'],
    sortOrder: 33,
    content: {
      principle: "Every deal should serve both the buyer and the seller genuinely. If you can't get there, walk away.",
      practicalApplication: [
        'Disclose everything, even when it hurts.',
        'Price listings accurately even when sellers resist.',
        'Tell buyers what you actually think, even when they don\'t want to hear it.',
        "Walk away from transactions that require compromising your client's interests.",
      ],
      businessCase: "The referral and repeat business value of one client treated with absolute integrity over a 10-year relationship is worth more than five commissions earned by cutting corners. Win-Win is not idealism — it's math.",
    },
  },
  // ── Team & Leadership Models ─────────────────────────────────
  {
    modelId: 'gwc',
    title: 'GWC — Get It, Want It, Capacity to Do It',
    category: 'team_leadership' as const,
    summary: 'The three-question hiring and team health filter from EOS/Traction, deeply integrated into KW team building. All three must be true for a team member to be in the right seat.',
    relevantLevels: [2, 3, 4, 5, 6, 7],
    relatedModels: ['ttsa', 'talent-triangle', 'organizational-model'],
    sortOrder: 40,
    content: {
      questions: [
        { question: 'Get It?', description: 'Do they deeply understand the role, the culture, and what success looks like — without needing constant explanation?', redFlag: "If you find yourself constantly explaining the obvious, they might not Get It." },
        { question: 'Want It?', description: 'Do they genuinely want this role — not just the paycheck, but the work itself?', redFlag: 'Motivation from external rewards only (money, praise) without intrinsic drive is a Want It problem.' },
        { question: 'Capacity?', description: 'Do they have the mental, emotional, physical, and time capacity to do this role well?', redFlag: 'Capacity problems are often invisible in hiring and only appear under load.' },
      ],
      application: "Run this check at hiring AND quarterly for existing team members. People's answers change as their lives change.",
    },
  },
  {
    modelId: 'talent-triangle',
    title: 'The Talent Triangle',
    category: 'team_leadership' as const,
    summary: 'Every team member is assessed across three dimensions: Skills (learned, trainable), Knowledge (information-based, learnable), and Attitude (innate, very hard to change). Hire for Attitude.',
    relevantLevels: [2, 3, 4, 5, 6, 7],
    relatedModels: ['gwc', 'ttsa', 'organizational-model'],
    sortOrder: 41,
    content: {
      dimensions: [
        { dimension: 'Skills', description: 'Specific capabilities that can be taught and practiced. CRM proficiency, objection handling, transaction coordination.', trainable: true },
        { dimension: 'Knowledge', description: 'Information about the market, the contract, the process. Can be learned from study and experience.', trainable: true },
        { dimension: 'Attitude', description: 'Work ethic, coachability, resilience, customer orientation. Deeply set by the time someone is an adult.', trainable: false },
      ],
      hiringImplication: "You cannot train Attitude. Hire the person with the right Attitude, then train Skills and Knowledge.",
    },
  },
  {
    modelId: 'ttsa',
    title: 'TTSA — Talent, Training, Systems, Accountability',
    category: 'team_leadership' as const,
    summary: 'The four-element framework for evaluating and developing each team member. Used in quarterly one-on-ones and hiring decisions.',
    relevantLevels: [2, 3, 4, 5, 6, 7],
    relatedModels: ['gwc', 'talent-triangle', 'organizational-model', 'career-visioning'],
    sortOrder: 42,
    content: {
      elements: [
        { element: 'Talent', question: 'Do they have the natural ability for this role?', action: 'Assess during hiring. Reassess if performance consistently underperforms training.' },
        { element: 'Training', question: 'Do they have the specific knowledge and skills this role requires?', action: 'Build a 90-day training plan for every new hire. Review quarterly.' },
        { element: 'Systems', question: 'Are there documented systems in place for what they do?', action: 'Document every repeatable process. If it only lives in someone\'s head, it\'s not a system.' },
        { element: 'Accountability', question: 'Are they held to clear metrics and given feedback when they miss?', action: 'Every role needs a scorecard. Every scorecard needs a weekly review.' },
      ],
    },
  },
  {
    modelId: 'disc-application',
    title: 'DISC Application in Real Estate Teams',
    category: 'team_leadership' as const,
    summary: 'How to use DISC behavioral profiles to communicate more effectively with team members, assign roles that match behavioral style, and resolve style conflicts.',
    relevantLevels: [3, 4, 5, 6, 7],
    relatedModels: ['gwc', 'ttsa', 'organizational-model'],
    sortOrder: 43,
    content: {
      profiles: [
        { style: 'D — Dominant', strengths: 'Results-oriented, decisive, direct, takes charge.', challenges: "Can be blunt, impatient, overlooks people's feelings.", communicateTo: 'Be direct. Lead with results. Skip small talk. Give them autonomy.', bestRoles: ['Team Leader', 'Listing Specialist', 'Director of Sales'] },
        { style: 'I — Influencing', strengths: 'Enthusiastic, persuasive, relationship-builder, optimistic.', challenges: 'Disorganized, over-commits, struggles with follow-through.', communicateTo: 'Be warm and conversational. Focus on the relationship. Give recognition.', bestRoles: ["Buyer's Agent", 'Lead Conversion', 'Client Events'] },
        { style: 'S — Steady', strengths: 'Reliable, patient, team player, consistent, great listener.', challenges: 'Resistant to change, avoids conflict, slow to decide.', communicateTo: 'Be patient. Give time to process. Emphasize stability. Avoid surprises.', bestRoles: ['Transaction Coordinator', 'Operations Manager', 'Client Care'] },
        { style: 'C — Conscientious', strengths: 'Detail-oriented, analytical, accurate, high standards.', challenges: 'Perfectionistic, over-analyzes, slow to act.', communicateTo: 'Provide data and logic. Allow preparation time. Don\'t rush decisions.', bestRoles: ['Executive Assistant', 'Marketing Analytics'] },
      ],
    },
  },
  {
    modelId: 'career-visioning',
    title: 'Career Visioning Framework',
    category: 'team_leadership' as const,
    summary: 'A structured one-on-one framework for understanding where team members want to go in their career and what the team leader needs to do to help them get there.',
    relevantLevels: [3, 4, 5, 6, 7],
    relatedModels: ['ttsa', 'gwc', 'organizational-model'],
    sortOrder: 44,
    content: {
      questions: [
        'Where do you want to be in your career in 3 years?',
        'What role do you want to play on this team — or beyond it?',
        'What skills do you most want to develop in the next 12 months?',
        'What would make your job here significantly better or more meaningful?',
        'What do you need from me as a leader that you\'re not getting?',
        'What are you most proud of from the last quarter?',
        'What do you wish you\'d done differently?',
      ],
      leaderResponsibility: "The team leader's job is not to retain people forever — it's to develop people so well that they could leave, but to build an environment where they choose to stay.",
    },
  },
  {
    modelId: 'five-team-models',
    title: 'The Five Models for Team Success',
    category: 'team_leadership' as const,
    summary: 'The MREA team version of the core models: Economic, Lead Generation, Organizational, Budget, and Compensation. Every team leader should have all five built and active before hiring their second agent.',
    relevantLevels: [3, 4, 5, 6, 7],
    relatedModels: ['economic-model', 'lead-generation-model', 'budget-model', 'organizational-model'],
    sortOrder: 45,
    content: {
      models: [
        { model: 'Team Economic Model', description: 'GCI goal for the team, broken down by role. Each agent has a production target that aggregates to the team goal.' },
        { model: 'Team Lead Generation Model', description: 'How many leads does the team generate? Who generates them? How are they distributed and tracked?' },
        { model: 'Organizational Model', description: 'Who does what. Org chart, role descriptions, and the TTSA status for each person.' },
        { model: 'Team Budget Model', description: 'Revenue split structure, expense ratios for the team P&L, and break-even analysis.' },
        { model: 'Compensation Model', description: 'How each role is compensated. Splits for BAs, salary + bonus for staff, performance thresholds.' },
      ],
    },
  },
  // ── Coaching & Accountability Models ──────────────────────────
  {
    modelId: 'coaching-conversation',
    title: 'The KW Coaching Conversation Framework',
    category: 'coaching_accountability' as const,
    summary: 'The structured format for a productive coaching session: Segue → Commitment Review → Hot Seat → Teaching → New Commitments → IDS. Each segment has a purpose and a time allocation.',
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['accountability-ladder', 'belief-model', 'gps'],
    sortOrder: 50,
    content: {
      segments: [
        { name: 'Segue', duration: '5 min', purpose: "Open with a win. What's something good that happened since last session? Sets a positive context before accountability begins." },
        { name: 'Commitment Review', duration: '10 min', purpose: "Review last session's commitments. Complete? Not complete? What got in the way? No judgment — just data." },
        { name: 'Hot Seat', duration: '20 min', purpose: 'The agent brings their biggest current challenge. Coach asks questions rather than giving advice. Goal: agent discovers their own answer.' },
        { name: 'Teaching Block', duration: '15 min', purpose: 'Coach introduces a framework, tool, or concept relevant to where the agent is in their MREA journey.' },
        { name: 'New Commitments', duration: '5 min', purpose: 'Agent sets 2–3 specific, measurable commitments for before the next session. Coach writes them down.' },
        { name: 'IDS', duration: '5 min', purpose: 'Identify, Discuss, Solve. Surface any open issues that need to be addressed before next session.' },
      ],
      totalDuration: '60 minutes',
      hotSeatPrinciple: "The coach's job in the hot seat is not to be the smartest person in the room. It's to ask the question that helps the agent be the smartest person about their own situation.",
    },
  },
  {
    modelId: 'accountability-ladder',
    title: 'The Accountability Ladder',
    category: 'coaching_accountability' as const,
    summary: "A diagnostic framework for understanding where an agent is psychologically when they're not following through on commitments. From Blame at the bottom to Ownership at the top.",
    relevantLevels: [1, 2, 3, 4, 5, 6, 7],
    relatedModels: ['belief-model', 'coaching-conversation'],
    sortOrder: 51,
    content: {
      levels: [
        { level: 1, name: 'Blame', description: "It's someone else's fault. The market, the leads, the broker.", coachingResponse: "Don't argue with the blame. Ask: \"Assuming that's true, what would you do differently?\"" },
        { level: 2, name: 'Justification', description: 'I have a good reason for not doing it.', coachingResponse: 'Acknowledge the reason. Then ask: "And is that reason more important than the result you want?"' },
        { level: 3, name: 'Shame', description: "I'm bad at this. I'll never be good enough.", coachingResponse: 'Challenge the identity claim. "Is that actually true, or is that what it feels like right now?"' },
        { level: 4, name: 'Obligation', description: 'I have to do this because someone expects me to.', coachingResponse: 'External motivation. Move toward internal. "What would you do if no one was watching?"' },
        { level: 5, name: 'Responsibility', description: 'I acknowledge this is on me.', coachingResponse: 'Good. Build from here. "What specifically will you do, by when?"' },
        { level: 6, name: 'Accountability', description: 'I own my results and actively monitor my progress.', coachingResponse: 'Reinforce the behavior. "What systems do you have in place to stay on track?"' },
        { level: 7, name: 'Ownership', description: "I drive my results. I don't wait for external accountability.", coachingResponse: 'The goal state. "What are you going to do with this next?"' },
      ],
    },
  },
];

export async function seedModelLibrary() {
  const db = await getDb();
  if (!db) return;
  let added = 0;
  let skipped = 0;

  for (const model of KW_MODELS) {
    const existing = await db.select().from(modelLibrary).where(eq(modelLibrary.modelId, model.modelId)).limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(modelLibrary).values({
      modelId: model.modelId,
      title: model.title,
      category: model.category,
      summary: model.summary,
      content: model.content,
      relevantLevels: model.relevantLevels,
      relatedModels: model.relatedModels,
      sortOrder: model.sortOrder,
      isActive: true,
    });
    added++;
  }

  console.log(`[Seed] KW Model Library: ${added} models added, ${skipped} already existed`);
}
