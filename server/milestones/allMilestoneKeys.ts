// server/milestones/allMilestoneKeys.ts
// Authoritative list of all Agent (T6–T9) and Business (T10–T13) milestone keys.
// T1–T5 (wealth domain) remain in server/wealth/milestoneKeys.ts.
//
// SMART completion standard: every milestone has a binary, verifiable
// "done" criterion — you can point to the artifact or you cannot.

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN: agent  (Tracks 6–9, 32 milestones)
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_MILESTONE_KEYS = {
  // Track 6 — Agent Infrastructure & Compliance (8)
  T6_LICENSE_ACTIVE:              't6_license_active',
  T6_EO_INSURANCE_ACTIVE:         't6_eo_insurance_active',
  T6_COMMAND_PROFILE_COMPLETE:    't6_command_profile_complete',
  T6_GOOGLE_BUSINESS_CLAIMED:     't6_google_business_claimed',
  T6_MLS_DUES_CURRENT:            't6_mls_dues_current',
  T6_PROFESSIONAL_HEADSHOTS:      't6_professional_headshots',
  T6_DIGITAL_SIGNATURE_ACTIVE:    't6_digital_signature_active',
  T6_WEBSITE_LIVE_IDX:            't6_website_live_idx',

  // Track 7 — Lead Generation Engine (9)
  T7_CRM_200_CONTACTS:            't7_crm_200_contacts',
  T7_33_TOUCH_PLAN_ACTIVE:        't7_33_touch_plan_active',
  T7_GEOGRAPHIC_FARM_DEFINED:     't7_geographic_farm_defined',
  T7_FIRST_SPHERE_MAILER_SENT:    't7_first_sphere_mailer_sent',
  T7_ZILLOW_PROFILE_OPTIMIZED:    't7_zillow_profile_optimized',
  T7_OPEN_HOUSE_SYSTEM_BUILT:     't7_open_house_system_built',
  T7_REFERRAL_PARTNER_5:          't7_referral_partner_5',
  T7_LEAD_SOURCE_TRACKED:         't7_lead_source_tracked',
  T7_PAID_CAMPAIGN_LIVE:          't7_paid_campaign_live',

  // Track 8 — Transaction & Client Experience (8)
  T8_BUYER_CONSULT_SOP:           't8_buyer_consult_sop',
  T8_LISTING_PRESENTATION_BUILT:  't8_listing_presentation_built',
  T8_TRANSACTION_COORDINATOR:     't8_transaction_coordinator',
  T8_CLOSING_GIFT_SYSTEM:         't8_closing_gift_system',
  T8_REVIEW_REQUEST_SYSTEM:       't8_review_request_system',
  T8_10_VERIFIED_REVIEWS:         't8_10_verified_reviews',
  T8_25_TRANSACTIONS_CLOSED:      't8_25_transactions_closed',
  T8_REPEAT_REFERRAL_20PCT:       't8_repeat_referral_20pct',

  // Track 9 — Personal Brand & Content (7)
  T9_SOCIAL_PROFILES_ACTIVE:      't9_social_profiles_active',
  T9_30_POSTS_PUBLISHED:          't9_30_posts_published',
  T9_EMAIL_LIST_100:               't9_email_list_100',
  T9_EMAIL_NEWSLETTER_SENT:       't9_email_newsletter_sent',
  T9_VIDEO_SERIES_STARTED:        't9_video_series_started',
  T9_500_LINKEDIN_CONNECTIONS:    't9_500_linkedin_connections',
  T9_LOCAL_MEDIA_FEATURE:         't9_local_media_feature',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN: business  (Tracks 10–13, 32 milestones + 3 stretch capstones = 35)
// ─────────────────────────────────────────────────────────────────────────────

export const BUSINESS_MILESTONE_KEYS = {
  // Track 10 — Systems & Operations (8)
  T10_ANNUAL_BUSINESS_PLAN:       't10_annual_business_plan',
  T10_WEEKLY_KPI_TRACKER:         't10_weekly_kpi_tracker',
  T10_TIME_BLOCK_SCHEDULE:        't10_time_block_schedule',
  T10_SOP_LIBRARY_5:              't10_sop_library_5',
  T10_PROJECT_MGMT_TOOL_ACTIVE:   't10_project_mgmt_tool_active',
  T10_80PCT_ADMIN_AUTOMATED:      't10_80pct_admin_automated',
  T10_EA_VA_HIRED:                't10_ea_va_hired',
  T10_ANNUAL_BUSINESS_REVIEW:     't10_annual_business_review',

  // Track 11 — Sales & Negotiation Mastery (8)
  T11_SCRIPTS_MASTERED:           't11_scripts_mastered',
  T11_NEGOTIATION_TRAINING:       't11_negotiation_training',
  T11_CONVERSION_BY_SOURCE:       't11_conversion_by_source',
  T11_FOLLOWUP_SEQUENCES_BUILT:   't11_followup_sequences_built',
  T11_AVG_COMMISSION_TRACKED:     't11_avg_commission_tracked',
  T11_PIPELINE_REVIEWED_WEEKLY:   't11_pipeline_reviewed_weekly',
  T11_WIN_LOSS_REVIEW:            't11_win_loss_review',
  T11_100K_GCI_YEAR:              't11_100k_gci_year',

  // Track 12 — Leadership & Team Growth (8)
  T12_FIRST_HIRE:                 't12_first_hire',
  T12_HIRING_PROFILE_WRITTEN:     't12_hiring_profile_written',
  T12_ONBOARDING_CHECKLIST:       't12_onboarding_checklist',
  T12_11_CADENCE_ACTIVE:          't12_11_cadence_active',
  T12_TEAM_VALUES_WRITTEN:        't12_team_values_written',
  T12_COMP_STRUCTURE_DOCUMENTED:  't12_comp_structure_documented',
  T12_TEAM_MEMBER_PRODUCES:       't12_team_member_produces',
  T12_TEAM_REVENUE_EXCEEDS_SOLO:  't12_team_revenue_exceeds_solo',

  // Track 13 — Mindset, Health & Sustainability (8)
  T13_MORNING_ROUTINE_30_STREAK:  't13_morning_routine_30_streak',
  T13_ANNUAL_PHYSICAL:            't13_annual_physical',
  T13_COACH_OR_MENTOR_ENGAGED:    't13_coach_or_mentor_engaged',
  T13_2_WEEK_VACATION:            't13_2_week_vacation',
  T13_BUSINESS_RUNS_WITHOUT_OWNER:'t13_business_runs_without_owner',
  T13_READING_HABIT_6MO:          't13_reading_habit_6mo',
  T13_PERSONAL_VISION_WRITTEN:    't13_personal_vision_written',
  T13_SABBATH_PROTECTED:          't13_sabbath_protected',

  // Stretch Capstones (3) — unlocked last, require specific prerequisites
  T13_250K_GCI_YEAR:              't13_250k_gci_year',
  T13_PROPERTY_CASH_FLOW_POSITIVE:'t13_property_cash_flow_positive',
  T13_BUSINESS_30_DAY_ABSENCE:    't13_business_30_day_absence',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TRACK METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_TRACK_NAMES: Record<number, string> = {
  6: 'Agent Infrastructure & Compliance',
  7: 'Lead Generation Engine',
  8: 'Transaction & Client Experience',
  9: 'Personal Brand & Content',
};

export const BUSINESS_TRACK_NAMES: Record<number, string> = {
  10: 'Systems & Operations',
  11: 'Sales & Negotiation Mastery',
  12: 'Leadership & Team Growth',
  13: 'Mindset, Health & Sustainability',
};

export const AGENT_TRACK_MILESTONE_COUNTS: Record<number, number> = {
  6: 8, 7: 9, 8: 8, 9: 7,
};

export const BUSINESS_TRACK_MILESTONE_COUNTS: Record<number, number> = {
  10: 8, 11: 8, 12: 8, 13: 11, // 13 includes 3 stretch capstones
};

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONE METADATA — label + SMART done criterion + track
// ─────────────────────────────────────────────────────────────────────────────

export interface MilestoneMeta {
  label: string;
  description: string;
  doneCriterion: string;
  track: number;
  domain: 'agent' | 'business';
  isCapstone?: boolean;
}

export const AGENT_MILESTONE_META: Record<string, MilestoneMeta> = {

  // ── Track 6 ──────────────────────────────────────────────────────────────

  't6_license_active': {
    track: 6, domain: 'agent',
    label: 'Active License Confirmed',
    description: 'Your real estate license is current and your E&O is in force — the legal baseline for practicing.',
    doneCriterion: 'License renewal date is ≥ 12 months away OR renewal receipt on file. License number verifiable in state portal.',
  },
  't6_eo_insurance_active': {
    track: 6, domain: 'agent',
    label: 'E&O Insurance Current',
    description: 'Errors & Omissions insurance protects you against claims arising from transactions.',
    doneCriterion: 'Active policy certificate on file with policy number and expiration date ≥ 90 days out.',
  },
  't6_command_profile_complete': {
    track: 6, domain: 'agent',
    label: 'KW Command Profile Built',
    description: 'Your Command profile is your CRM foundation — incomplete profiles mean missed follow-through.',
    doneCriterion: 'Profile has photo, contact info, bio populated AND ≥ 1 active Smart Plan running with ≥ 1 assigned contact.',
  },
  't6_google_business_claimed': {
    track: 6, domain: 'agent',
    label: 'Google Business Profile Verified',
    description: 'Your Google Business Profile is the #1 local SEO asset a real estate agent controls directly.',
    doneCriterion: 'Profile shows "Verified" status in Google Business Manager. Business name, phone, address, and service area complete.',
  },
  't6_mls_dues_current': {
    track: 6, domain: 'agent',
    label: 'MLS Dues Paid & Current',
    description: 'Active MLS membership is required for access to inventory, listing data, and commission co-op.',
    doneCriterion: 'MLS account portal shows "Active" status with $0.00 past-due balance.',
  },
  't6_professional_headshots': {
    track: 6, domain: 'agent',
    label: 'Professional Headshots Complete',
    description: 'Your headshot is the first impression on every digital touchpoint — it signals trustworthiness.',
    doneCriterion: '≥ 5 edited, high-resolution (300dpi+) images delivered by a professional photographer within the last 3 years.',
  },
  't6_digital_signature_active': {
    track: 6, domain: 'agent',
    label: 'E-Signature Platform Active',
    description: 'Digital signatures are required for modern transaction speed and client experience.',
    doneCriterion: 'DocuSign, DotLoop, or equivalent account active. ≥ 1 envelope successfully sent and signed.',
  },
  't6_website_live_idx': {
    track: 6, domain: 'agent',
    label: 'Agent Website Live with IDX Search',
    description: 'A personal website with IDX is your owned lead capture channel — independent of any portal.',
    doneCriterion: 'URL resolves publicly. IDX search returns active MLS listings. Contact form submits and delivers to your email.',
  },

  // ── Track 7 ──────────────────────────────────────────────────────────────

  't7_crm_200_contacts': {
    track: 7, domain: 'agent',
    label: '200+ Contacts in CRM',
    description: 'Your database is your business. Below 200 contacts, you are working from scarcity.',
    doneCriterion: 'KW Command (or synced CRM) shows ≥ 200 records, each with a name and at least one contact method (phone or email).',
  },
  't7_33_touch_plan_active': {
    track: 7, domain: 'agent',
    label: '33-Touch Plan Active',
    description: 'Systematic multi-touch marketing to your sphere produces referrals without chasing.',
    doneCriterion: 'Smart Plan with ≥ 33 touchpoints is assigned to ≥ 50 contacts in Command and shows "Running" status.',
  },
  't7_geographic_farm_defined': {
    track: 7, domain: 'agent',
    label: 'Geographic Farm Defined',
    description: 'A defined farm creates consistent brand presence in a specific area and produces predictable listings.',
    doneCriterion: 'Written farm profile exists with: subdivision/zip name, verified address count ≥ 250, and first mailer sent with postage receipt.',
  },
  't7_first_sphere_mailer_sent': {
    track: 7, domain: 'agent',
    label: 'First Sphere Mailer Sent',
    description: 'Physical mail to your sphere remains one of the highest-ROI touches in real estate.',
    doneCriterion: 'Postage receipt or mail house delivery confirmation shows ≥ 100 pieces mailed to sphere database.',
  },
  't7_zillow_profile_optimized': {
    track: 7, domain: 'agent',
    label: 'Zillow / Realtor.com Profile Optimized',
    description: 'Consumer portals are where buyers search first — your profile there must convert.',
    doneCriterion: 'Profile has professional photo, bio ≥ 100 words, ≥ 5 past sales listed, and ≥ 1 verified client review visible.',
  },
  't7_open_house_system_built': {
    track: 7, domain: 'agent',
    label: 'Open House System Built',
    description: 'Open houses without a follow-up system are just time spent. A system converts visitors into clients.',
    doneCriterion: 'Written SOP covers: setup checklist, digital sign-in capture method, and a defined ≥ 5-touch follow-up sequence with templates.',
  },
  't7_referral_partner_5': {
    track: 7, domain: 'agent',
    label: '5 Active Referral Partners',
    description: 'Referral partners multiply your reach. Five active relationships create a consistent inbound stream.',
    doneCriterion: 'Written list of ≥ 5 partners (lenders, inspectors, attorneys, CPAs, etc.) each with documented evidence of ≥ 1 referral sent or received.',
  },
  't7_lead_source_tracked': {
    track: 7, domain: 'agent',
    label: 'Lead Source Tracking Active (30 Days)',
    description: 'If you do not know where leads come from, you cannot invest in what works.',
    doneCriterion: 'Every new lead in CRM has a source field populated. CRM report or export shows 100% source coverage for ≥ 30 consecutive days.',
  },
  't7_paid_campaign_live': {
    track: 7, domain: 'agent',
    label: 'Paid Lead Campaign Live',
    description: 'Paid campaigns buy speed and data. A live campaign tells you what your market responds to.',
    doneCriterion: 'Google Ads or Meta campaign with a minimum $200/month budget is active and dashboard shows ≥ 1 lead generated.',
  },

  // ── Track 8 ──────────────────────────────────────────────────────────────

  't8_buyer_consult_sop': {
    track: 8, domain: 'agent',
    label: 'Buyer Consultation SOP Documented',
    description: 'A documented buyer consult process ensures a consistent, professional experience every time.',
    doneCriterion: 'Written SOP with ≥ 8 defined steps exists, saved in a shared location (Drive, Notion, etc.), last updated within 12 months.',
  },
  't8_listing_presentation_built': {
    track: 8, domain: 'agent',
    label: 'Listing Presentation Built',
    description: 'Your listing presentation is your conversion tool. It must exist before you need it.',
    doneCriterion: 'Slide deck or printed presentation with ≥ 10 slides exists AND has been used in ≥ 1 live seller appointment.',
  },
  't8_transaction_coordinator': {
    track: 8, domain: 'agent',
    label: 'Transaction Coordinator Engaged',
    description: 'A TC removes you from contract-to-close admin so you can focus on lead gen.',
    doneCriterion: 'Signed agreement with a TC on file OR internal transaction checklist with ≥ 20 defined steps covering contract through close.',
  },
  't8_closing_gift_system': {
    track: 8, domain: 'agent',
    label: 'Client Gift System Built',
    description: 'A systematized gift process at closing creates memorable moments that produce referrals.',
    doneCriterion: 'Written process defines trigger event (contract, close, anniversary), gift item, and delivery method. Evidence it has been used on ≥ 3 closings.',
  },
  't8_review_request_system': {
    track: 8, domain: 'agent',
    label: 'Review Request System Active',
    description: 'Reviews are your digital social proof. Without a system, most happy clients never leave one.',
    doneCriterion: 'Automated or templated request sent within 3 business days of closing. Platform send history shows ≥ 5 requests sent.',
  },
  't8_10_verified_reviews': {
    track: 8, domain: 'agent',
    label: '10+ Verified Online Reviews',
    description: 'Ten reviews is the minimum threshold for social proof credibility with new prospects.',
    doneCriterion: '≥ 10 reviews visible (not hidden or filtered) across Google Business, Zillow, or Realtor.com profiles combined.',
  },
  't8_25_transactions_closed': {
    track: 8, domain: 'agent',
    label: '25 Transactions Closed',
    description: '25 closed sides builds sufficient pattern recognition to operate with real competence.',
    doneCriterion: 'Transaction history (CRM, MLS, or commission records) shows ≥ 25 closed sides (buy or sell) with verifiable dates.',
  },
  't8_repeat_referral_20pct': {
    track: 8, domain: 'agent',
    label: '20%+ Business from Repeat / Referral',
    description: 'When 20% of your business comes back to you, your database is working. Below that, you are starting over every year.',
    doneCriterion: 'In any rolling 12-month period, ≥ 20% of closed transactions tagged in CRM as "repeat client" or "direct referral."',
  },

  // ── Track 9 ──────────────────────────────────────────────────────────────

  't9_social_profiles_active': {
    track: 9, domain: 'agent',
    label: 'Social Business Profiles Active',
    description: 'Business profiles on Facebook and Instagram separate your personal presence from your professional brand.',
    doneCriterion: 'Facebook Business Page AND Instagram Business Account both live with professional cover photo, contact info, and category set to "Real Estate Agent."',
  },
  't9_30_posts_published': {
    track: 9, domain: 'agent',
    label: '30 Posts Published',
    description: 'Thirty posts establishes the habit and gives the algorithm enough signal to start distributing your content.',
    doneCriterion: 'Content calendar or profile grid shows ≥ 30 posts published across platforms with visible publish dates spanning ≥ 60 days.',
  },
  't9_email_list_100': {
    track: 9, domain: 'agent',
    label: 'Email List: 100+ Subscribers',
    description: 'Your email list is the only audience you own. 100 is the floor for meaningful engagement data.',
    doneCriterion: 'Email platform (Mailchimp, Klaviyo, etc.) subscriber list shows ≥ 100 confirmed (double opt-in or imported with consent) subscribers.',
  },
  't9_email_newsletter_sent': {
    track: 9, domain: 'agent',
    label: '6 Newsletters Sent',
    description: 'Six sends builds the habit and provides enough data to measure open rate and engagement.',
    doneCriterion: 'Email platform send history shows ≥ 6 distinct campaign sends to ≥ 100 recipients each, over any period.',
  },
  't9_video_series_started': {
    track: 9, domain: 'agent',
    label: 'Video Series Started (5+ Videos)',
    description: 'A video series — not one-offs — builds authority and discoverability over time.',
    doneCriterion: '≥ 5 published videos on YouTube, Instagram Reels, or TikTok in a consistent series format (same theme, similar structure). All publicly accessible.',
  },
  't9_500_linkedin_connections': {
    track: 9, domain: 'agent',
    label: '500+ LinkedIn Connections',
    description: 'LinkedIn is the referral network for professional and relocation buyers — 500 is the credibility threshold.',
    doneCriterion: 'LinkedIn profile shows "500+" connections. Profile includes professional headshot, headline, and summary targeting your market.',
  },
  't9_local_media_feature': {
    track: 9, domain: 'agent',
    label: 'Local Media Mention or Feature',
    description: 'Third-party media mentions are the highest-trust form of social proof available to local agents.',
    doneCriterion: 'Screenshot or live URL showing a published article, podcast episode, radio/TV segment, or news feature that mentions you by full name.',
  },
};

export const BUSINESS_MILESTONE_META: Record<string, MilestoneMeta> = {

  // ── Track 10 ─────────────────────────────────────────────────────────────

  't10_annual_business_plan': {
    track: 10, domain: 'business',
    label: 'Annual Business Plan Written',
    description: 'A written plan converts intent into direction. Without it, you are reacting instead of executing.',
    doneCriterion: 'One-page plan exists with: GCI goal, unit goal, lead gen budget, and ≥ 3 strategic priorities. Updated within the last 12 months.',
  },
  't10_weekly_kpi_tracker': {
    track: 10, domain: 'business',
    label: 'Weekly KPI Tracker Active',
    description: 'What gets measured gets managed. Weekly KPI tracking is the difference between a business and a job.',
    doneCriterion: 'Dashboard, spreadsheet, or platform view is updated with KPI data (leads, appointments, contracts, closings) for ≥ 8 consecutive weeks with no gaps.',
  },
  't10_time_block_schedule': {
    track: 10, domain: 'business',
    label: 'Time-Block Schedule Locked',
    description: 'A protected schedule is the foundation of consistent lead generation at scale.',
    doneCriterion: 'Written weekly schedule with ≥ 4 protected lead gen blocks and ≥ 1 admin block exists AND is in active use for ≥ 21 consecutive days.',
  },
  't10_sop_library_5': {
    track: 10, domain: 'business',
    label: 'SOP Library: 5+ Documented Processes',
    description: 'SOPs make your business trainable, scalable, and survivable when you are unavailable.',
    doneCriterion: '≥ 5 written SOPs exist in a shared location (Notion, Drive, etc.), each with defined steps, an assigned owner, and last updated within 12 months.',
  },
  't10_project_mgmt_tool_active': {
    track: 10, domain: 'business',
    label: 'Project Management Tool in Use',
    description: 'A PM tool externalizes your brain and gives your team a single source of task truth.',
    doneCriterion: 'Asana, Notion, Trello, ClickUp, or equivalent shows ≥ 3 active projects or boards with tasks updated within the last 7 days.',
  },
  't10_80pct_admin_automated': {
    track: 10, domain: 'business',
    label: '80% of Admin Tasks Automated',
    description: 'Automation reclaims your highest-value asset — time. 80% is the threshold where you stop being an admin.',
    doneCriterion: 'Written audit lists all recurring admin tasks. ≥ 80% are marked as handled by automation, template, or delegation. Reviewed within the last 90 days.',
  },
  't10_ea_va_hired': {
    track: 10, domain: 'business',
    label: 'EA or VA Hired (10+ hrs/week)',
    description: 'Your first hire is the hardest and most important leverage point in a solo agent business.',
    doneCriterion: 'Signed contract, offer letter, or VA platform agreement on file showing ≥ 10 committed hours/week with ≥ 4 defined recurring responsibilities.',
  },
  't10_annual_business_review': {
    track: 10, domain: 'business',
    label: 'Annual Business Review Completed',
    description: 'An annual review closes the learning loop. Without it, you repeat mistakes at higher volume.',
    doneCriterion: 'Written review document exists covering: prior year GCI vs. goal, top 3 wins, top 3 lessons, and priorities for next year. Dated within 90 days of year-end.',
  },

  // ── Track 11 ─────────────────────────────────────────────────────────────

  't11_scripts_mastered': {
    track: 11, domain: 'business',
    label: 'Core Scripts Mastered',
    description: 'Scripts are not about sounding scripted — they are about having thought through every conversation in advance.',
    doneCriterion: 'Role-play session logged with coach OR recorded self-practice file exists for: buyer consult script, listing script, and ≥ 3 objection-handling scripts.',
  },
  't11_negotiation_training': {
    track: 11, domain: 'business',
    label: 'Negotiation Training Completed',
    description: 'Formal negotiation training pays for itself on the first deal where you use it.',
    doneCriterion: 'Certificate of completion OR dated session notes from a formal negotiation course (MREA, NAR CNE/SRES, or equivalent external training).',
  },
  't11_conversion_by_source': {
    track: 11, domain: 'business',
    label: 'Conversion Tracked by Lead Source',
    description: 'Knowing your conversion rate by source tells you where to invest and where to stop spending.',
    doneCriterion: 'CRM report or spreadsheet shows appointment-to-contract conversion rate calculated per lead source for ≥ 90 consecutive days of data.',
  },
  't11_followup_sequences_built': {
    track: 11, domain: 'business',
    label: 'Follow-Up Sequences Built (3 Types)',
    description: 'Different lead types need different sequences. One generic drip is not a system.',
    doneCriterion: 'Written or automated follow-up sequences exist for ≥ 3 distinct lead types (e.g., buyer, seller, past client), each with ≥ 5 defined touches and message templates.',
  },
  't11_avg_commission_tracked': {
    track: 11, domain: 'business',
    label: 'Average Commission Per Side Tracked',
    description: 'Knowing your average commission lets you reverse-engineer the activity required to hit any income goal.',
    doneCriterion: 'Spreadsheet or report shows average GCI per closed side calculated from ≥ 10 actual transactions, updated within the last 6 months.',
  },
  't11_pipeline_reviewed_weekly': {
    track: 11, domain: 'business',
    label: 'Pipeline Reviewed Weekly',
    description: 'Weekly pipeline reviews prevent stale deals and keep your forecast honest.',
    doneCriterion: 'Calendar shows recurring pipeline review block AND written notes or screenshot evidence of completion for ≥ 8 consecutive weeks.',
  },
  't11_win_loss_review': {
    track: 11, domain: 'business',
    label: 'Win/Loss Review Cadence Established',
    description: 'Without a win/loss review, you cannot learn from the deals you lost or replicate the ones you won.',
    doneCriterion: 'Written review template exists. Template has been completed for ≥ 5 distinct won or lost opportunities with root cause identified in each.',
  },
  't11_100k_gci_year': {
    track: 11, domain: 'business',
    label: '$100K GCI in a Calendar Year',
    description: '$100K GCI is the first proof point that your business model works. It is the floor, not the ceiling.',
    doneCriterion: 'Closed transaction commission statements total ≥ $100,000 gross in a single calendar year. Verifiable via brokerage records.',
  },

  // ── Track 12 ─────────────────────────────────────────────────────────────

  't12_first_hire': {
    track: 12, domain: 'business',
    label: 'First Hire or IC Onboarded',
    description: 'Your first hire changes your identity from agent to business owner.',
    doneCriterion: 'Signed W-2, W-9, or IC agreement on file. Individual has completed ≥ 1 assigned, documented task.',
  },
  't12_hiring_profile_written': {
    track: 12, domain: 'business',
    label: 'Ideal Hire Profile Written',
    description: 'Hiring without a profile is guessing. A written profile forces clarity on what you actually need.',
    doneCriterion: 'Written document defines: role title, top 5 required skills, cultural values fit criteria, and compensation range/structure.',
  },
  't12_onboarding_checklist': {
    track: 12, domain: 'business',
    label: 'Onboarding Checklist Documented',
    description: 'A documented onboarding checklist determines whether your next hire succeeds or fails.',
    doneCriterion: 'Written checklist with ≥ 15 steps covering: systems access, tool training, role clarity, and 30/60/90-day expectations. Saved in shared location.',
  },
  't12_11_cadence_active': {
    track: 12, domain: 'business',
    label: '1:1 Coaching Cadence Active',
    description: 'Weekly 1:1s are the primary accountability and development mechanism for each team member.',
    doneCriterion: 'Calendar shows ≥ 1 recurring 1:1 per team member per week. Written meeting notes exist for ≥ 4 consecutive weekly sessions per team member.',
  },
  't12_team_values_written': {
    track: 12, domain: 'business',
    label: 'Team Culture Document Written',
    description: 'A written culture document makes your values operational — it is the filter for every hire and every decision.',
    doneCriterion: 'Written document defines ≥ 5 team values with behavioral descriptions for each. Document has been shared with and acknowledged by all current team members.',
  },
  't12_comp_structure_documented': {
    track: 12, domain: 'business',
    label: 'Compensation Structure Documented',
    description: 'A written comp plan removes ambiguity and protects both parties.',
    doneCriterion: 'Written compensation plan exists for each team role showing base/split/bonus triggers. Signed or acknowledged by each team member.',
  },
  't12_team_member_produces': {
    track: 12, domain: 'business',
    label: 'Team Member Hits Productivity Benchmark',
    description: 'A team member who closes 12+ sides/year proves your systems can replicate your results.',
    doneCriterion: '≥ 1 team member closes ≥ 12 sides in a single calendar year. Verifiable via brokerage records or MLS history.',
  },
  't12_team_revenue_exceeds_solo': {
    track: 12, domain: 'business',
    label: 'Team GCI Exceeds Prior Solo Ceiling',
    description: 'When your team produces more than you ever did solo, leverage is working.',
    doneCriterion: 'Team combined GCI in any 12-month period exceeds your highest GCI year as a solo agent. Documented with commission records for both periods.',
  },

  // ── Track 13 ─────────────────────────────────────────────────────────────

  't13_morning_routine_30_streak': {
    track: 13, domain: 'business',
    label: 'Morning Routine: 30-Day Streak',
    description: 'A consistent morning routine is the single highest-ROI daily habit for sustained high performance.',
    doneCriterion: 'Written routine document exists AND habit tracker, journal, or app shows ≥ 30 consecutive days completed without a gap.',
  },
  't13_annual_physical': {
    track: 13, domain: 'business',
    label: 'Annual Physical Completed',
    description: 'Your physical health is your most important business asset. Annual physicals catch problems early.',
    doneCriterion: 'Doctor visit record, patient portal summary, or EOB shows a completed preventive physical within the last 12 months.',
  },
  't13_coach_or_mentor_engaged': {
    track: 13, domain: 'business',
    label: 'Coach or Mentor Engaged',
    description: 'Every high performer has a coach. Coaching compresses the time between where you are and where you want to be.',
    doneCriterion: 'Active coaching agreement, signed mastermind membership, or recurring mentor calendar invite showing ≥ 1 session per month for ≥ 3 consecutive months.',
  },
  't13_2_week_vacation': {
    track: 13, domain: 'business',
    label: '2-Week Vacation Taken',
    description: 'A 2-week vacation is a stress test of your systems. If the business breaks, you have a job, not a business.',
    doneCriterion: 'Calendar shows ≥ 10 consecutive business days off. Evidence that GCI-generating activities continued without daily owner intervention during that period.',
  },
  't13_business_runs_without_owner': {
    track: 13, domain: 'business',
    label: 'Business Runs 5 Days Without Owner',
    description: 'The test of a real business: can it operate when you are not there?',
    doneCriterion: 'Documented 5-consecutive-business-day period where the owner was not involved in daily operations AND at least 1 revenue-generating activity occurred.',
  },
  't13_reading_habit_6mo': {
    track: 13, domain: 'business',
    label: 'Reading Habit: 1 Book/Month for 6 Months',
    description: 'Leaders are readers. A six-month reading streak demonstrates sustained commitment to growth.',
    doneCriterion: 'Book log, reading tracker app, or written list shows ≥ 6 distinct books completed across 6 consecutive calendar months.',
  },
  't13_personal_vision_written': {
    track: 13, domain: 'business',
    label: 'Personal Vision & Values Written',
    description: 'A written personal vision is the North Star that prevents you from succeeding at the wrong things.',
    doneCriterion: 'Written document of ≥ 1 page exists defining: personal core values (≥ 5), 10-year life vision, and personal definition of success. Dated and saved.',
  },
  't13_sabbath_protected': {
    track: 13, domain: 'business',
    label: 'Weekly Recovery Practice Protected',
    description: 'Sustained high performance requires deliberate recovery. Without it, you are borrowing against tomorrow.',
    doneCriterion: 'Calendar shows ≥ 1 recurring full-day or equivalent recovery block per week maintained without exceptions for ≥ 30 consecutive days.',
  },

  // ── Stretch Capstones ─────────────────────────────────────────────────────

  't13_250k_gci_year': {
    track: 13, domain: 'business',
    label: '$250K GCI in a Calendar Year',
    description: '$250K GCI puts you in the top tier of individual agent producers and proves your systems scale.',
    doneCriterion: 'Closed commission statements total ≥ $250,000 gross in a single calendar year. Verifiable via brokerage records.',
    isCapstone: true,
  },
  't13_property_cash_flow_positive': {
    track: 13, domain: 'business',
    label: 'Investment Property Cash Flow Positive',
    description: 'A cash-flowing property is proof your real estate knowledge is creating wealth, not just income.',
    doneCriterion: 'Monthly income/expense statement for ≥ 1 investment property shows positive net cash flow for ≥ 3 consecutive months. Statement on file.',
    isCapstone: true,
  },
  't13_business_30_day_absence': {
    track: 13, domain: 'business',
    label: 'Business Operates 30 Days Without Owner',
    description: 'Thirty days of owner absence with revenue continuing is the proof of a true enterprise.',
    doneCriterion: 'Documented 30-consecutive-day period where owner was absent from daily operations AND team produced ≥ 1 closed transaction without owner involvement.',
    isCapstone: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TRACK UNLOCK LOGIC
// ─────────────────────────────────────────────────────────────────────────────

type MilestoneRow = { milestoneKey: string; status: string | null; domain?: string | null };

/**
 * Returns the set of unlocked track numbers for the agent domain.
 * Track 6 is always unlocked. Each subsequent track requires ≥ 4 done in the prior track.
 */
export function computeUnlockedAgentTracks(milestones: MilestoneRow[]): number[] {
  const agentMilestones = milestones.filter(m => !m.domain || m.domain === 'agent');
  const doneInTrack = (track: number): number => {
    const keys = Object.values(AGENT_MILESTONE_KEYS).filter(k => {
      const meta = AGENT_MILESTONE_META[k];
      return meta && meta.track === track;
    });
    return keys.filter(k => agentMilestones.some(m => m.milestoneKey === k && m.status === 'done')).length;
  };

  const unlocked: number[] = [6];
  if (doneInTrack(6) >= 4) unlocked.push(7);
  if (doneInTrack(7) >= 4) unlocked.push(8);
  if (doneInTrack(8) >= 4) unlocked.push(9);
  return unlocked;
}

/**
 * Returns the set of unlocked track numbers for the business domain.
 * Track 10 is always unlocked. Track 11 requires ≥ 4 done in T10.
 * Track 12 requires ≥ 4 done in T11 (including $100K GCI).
 * Track 13 requires ≥ 4 done in T12.
 */
export function computeUnlockedBusinessTracks(milestones: MilestoneRow[]): number[] {
  const bizMilestones = milestones.filter(m => !m.domain || m.domain === 'business');
  const doneInTrack = (track: number): number => {
    const keys = Object.values(BUSINESS_MILESTONE_KEYS).filter(k => {
      const meta = BUSINESS_MILESTONE_META[k];
      return meta && meta.track === track;
    });
    return keys.filter(k => bizMilestones.some(m => m.milestoneKey === k && m.status === 'done')).length;
  };
  const has100kGci = bizMilestones.some(m => m.milestoneKey === 't11_100k_gci_year' && m.status === 'done');

  const unlocked: number[] = [10];
  if (doneInTrack(10) >= 4) unlocked.push(11);
  if (doneInTrack(11) >= 4 && has100kGci) unlocked.push(12);
  if (doneInTrack(12) >= 4) unlocked.push(13);
  return unlocked;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH SCORE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a 0–100 health score for the agent domain (32 milestones).
 * Done = 1 pt, in_progress = 0.5 pt.
 */
export function computeAgentHealthScore(milestones: MilestoneRow[]): number {
  const TOTAL = 32;
  const agentKeys = Object.values(AGENT_MILESTONE_KEYS) as string[];
  const agentMilestones = milestones.filter(m => agentKeys.includes(m.milestoneKey));
  const earned = agentMilestones.reduce((sum, m) => {
    if (m.status === 'done') return sum + 1;
    if (m.status === 'in_progress') return sum + 0.5;
    return sum;
  }, 0);
  return Math.min(100, Math.round((earned / TOTAL) * 100));
}

/**
 * Compute a 0–100 health score for the business domain (35 milestones incl. capstones).
 * Done = 1 pt, in_progress = 0.5 pt.
 */
export function computeBusinessHealthScore(milestones: MilestoneRow[]): number {
  const TOTAL = 35;
  const bizKeys = Object.values(BUSINESS_MILESTONE_KEYS) as string[];
  const bizMilestones = milestones.filter(m => bizKeys.includes(m.milestoneKey));
  const earned = bizMilestones.reduce((sum, m) => {
    if (m.status === 'done') return sum + 1;
    if (m.status === 'in_progress') return sum + 0.5;
    return sum;
  }, 0);
  return Math.min(100, Math.round((earned / TOTAL) * 100));
}
