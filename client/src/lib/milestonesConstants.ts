// client/src/lib/milestonesConstants.ts
// Frontend mirror of server/milestones/allMilestoneKeys.ts
// Used by AgentJourney.tsx and BusinessJourney.tsx

export interface MilestoneMeta {
  key: string;
  label: string;
  description: string;
  doneCriterion: string;
  track: number;
  domain: 'agent' | 'business';
  isCapstone?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACK NAMES
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

// ─────────────────────────────────────────────────────────────────────────────
// AGENT MILESTONES (T6–T9, 32 total)
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_MILESTONES: MilestoneMeta[] = [
  // Track 6
  { key: 't6_license_active', track: 6, domain: 'agent', label: 'Active License Confirmed', description: 'Your real estate license is current and your E&O is in force.', doneCriterion: 'License renewal date ≥ 12 months away OR renewal receipt on file. License number verifiable in state portal.' },
  { key: 't6_eo_insurance_active', track: 6, domain: 'agent', label: 'E&O Insurance Current', description: 'Errors & Omissions insurance protects you against transaction claims.', doneCriterion: 'Active policy certificate on file with policy number and expiration ≥ 90 days out.' },
  { key: 't6_command_profile_complete', track: 6, domain: 'agent', label: 'KW Command Profile Built', description: 'Your Command profile is your CRM foundation.', doneCriterion: 'Profile has photo, contact info, bio AND ≥ 1 active Smart Plan with ≥ 1 assigned contact.' },
  { key: 't6_google_business_claimed', track: 6, domain: 'agent', label: 'Google Business Profile Verified', description: 'Your Google Business Profile is your #1 local SEO asset.', doneCriterion: 'Profile shows "Verified" status. Business name, phone, address, and service area complete.' },
  { key: 't6_mls_dues_current', track: 6, domain: 'agent', label: 'MLS Dues Paid & Current', description: 'Active MLS membership is required for inventory access and co-op.', doneCriterion: 'MLS account shows "Active" status with $0.00 past-due balance.' },
  { key: 't6_professional_headshots', track: 6, domain: 'agent', label: 'Professional Headshots Complete', description: 'Your headshot is the first impression on every digital touchpoint.', doneCriterion: '≥ 5 edited, high-resolution (300dpi+) images delivered by a professional photographer within the last 3 years.' },
  { key: 't6_digital_signature_active', track: 6, domain: 'agent', label: 'E-Signature Platform Active', description: 'Digital signatures are required for modern transaction speed.', doneCriterion: 'DocuSign, DotLoop, or equivalent active. ≥ 1 envelope successfully sent and signed.' },
  { key: 't6_website_live_idx', track: 6, domain: 'agent', label: 'Agent Website Live with IDX Search', description: 'A personal website with IDX is your owned lead capture channel.', doneCriterion: 'URL resolves publicly. IDX search returns active MLS listings. Contact form delivers to your email.' },

  // Track 7
  { key: 't7_crm_200_contacts', track: 7, domain: 'agent', label: '200+ Contacts in CRM', description: 'Your database is your business. Below 200 contacts, you are working from scarcity.', doneCriterion: 'CRM shows ≥ 200 records, each with a name and at least one contact method.' },
  { key: 't7_33_touch_plan_active', track: 7, domain: 'agent', label: '33-Touch Plan Active', description: 'Systematic multi-touch marketing produces referrals without chasing.', doneCriterion: 'Smart Plan with ≥ 33 touchpoints assigned to ≥ 50 contacts and shows "Running" status.' },
  { key: 't7_geographic_farm_defined', track: 7, domain: 'agent', label: 'Geographic Farm Defined', description: 'A defined farm creates consistent brand presence in a specific area.', doneCriterion: 'Written farm profile with subdivision/zip, ≥ 250 addresses, and first mailer sent with postage receipt.' },
  { key: 't7_first_sphere_mailer_sent', track: 7, domain: 'agent', label: 'First Sphere Mailer Sent', description: 'Physical mail to your sphere remains one of the highest-ROI touches.', doneCriterion: 'Postage receipt or mail house confirmation shows ≥ 100 pieces mailed to sphere database.' },
  { key: 't7_zillow_profile_optimized', track: 7, domain: 'agent', label: 'Zillow / Realtor.com Profile Optimized', description: 'Consumer portals are where buyers search first — your profile must convert.', doneCriterion: 'Profile has professional photo, bio ≥ 100 words, ≥ 5 past sales, and ≥ 1 verified review.' },
  { key: 't7_open_house_system_built', track: 7, domain: 'agent', label: 'Open House System Built', description: 'Open houses without a follow-up system are just time spent.', doneCriterion: 'Written SOP covers: setup checklist, digital sign-in, and ≥ 5-touch follow-up sequence with templates.' },
  { key: 't7_referral_partner_5', track: 7, domain: 'agent', label: '5 Active Referral Partners', description: 'Five active referral relationships create a consistent inbound stream.', doneCriterion: 'Written list of ≥ 5 partners each with evidence of ≥ 1 referral sent or received.' },
  { key: 't7_lead_source_tracked', track: 7, domain: 'agent', label: 'Lead Source Tracking Active (30 Days)', description: 'If you do not know where leads come from, you cannot invest in what works.', doneCriterion: 'Every new lead has a source field populated. 100% source coverage for ≥ 30 consecutive days.' },
  { key: 't7_paid_campaign_live', track: 7, domain: 'agent', label: 'Paid Lead Campaign Live', description: 'Paid campaigns buy speed and data.', doneCriterion: 'Google Ads or Meta campaign with minimum $200/month active and ≥ 1 lead generated.' },

  // Track 8
  { key: 't8_buyer_consult_sop', track: 8, domain: 'agent', label: 'Buyer Consultation SOP Documented', description: 'A documented buyer consult process ensures a consistent, professional experience.', doneCriterion: 'Written SOP with ≥ 8 defined steps, saved in shared location, updated within 12 months.' },
  { key: 't8_listing_presentation_built', track: 8, domain: 'agent', label: 'Listing Presentation Built', description: 'Your listing presentation is your conversion tool.', doneCriterion: 'Slide deck or printed presentation with ≥ 10 slides used in ≥ 1 live seller appointment.' },
  { key: 't8_transaction_coordinator', track: 8, domain: 'agent', label: 'Transaction Coordinator Engaged', description: 'A TC removes you from contract-to-close admin so you can focus on lead gen.', doneCriterion: 'Signed TC agreement on file OR internal checklist with ≥ 20 steps covering contract through close.' },
  { key: 't8_closing_gift_system', track: 8, domain: 'agent', label: 'Client Gift System Built', description: 'A systematized gift process creates memorable moments that produce referrals.', doneCriterion: 'Written process defines trigger event, gift item, and delivery. Used on ≥ 3 closings.' },
  { key: 't8_review_request_system', track: 8, domain: 'agent', label: 'Review Request System Active', description: 'Reviews are your digital social proof. Without a system, most happy clients never leave one.', doneCriterion: 'Automated or templated request sent within 3 business days of closing. ≥ 5 requests sent.' },
  { key: 't8_10_verified_reviews', track: 8, domain: 'agent', label: '10+ Verified Online Reviews', description: 'Ten reviews is the minimum threshold for social proof credibility.', doneCriterion: '≥ 10 reviews visible across Google Business, Zillow, or Realtor.com combined.' },
  { key: 't8_25_transactions_closed', track: 8, domain: 'agent', label: '25 Transactions Closed', description: '25 closed sides builds sufficient pattern recognition to operate with real competence.', doneCriterion: 'Transaction history shows ≥ 25 closed sides with verifiable dates.' },
  { key: 't8_repeat_referral_20pct', track: 8, domain: 'agent', label: '20%+ Business from Repeat / Referral', description: 'When 20% of your business comes back to you, your database is working.', doneCriterion: 'In any rolling 12-month period, ≥ 20% of closed transactions tagged as repeat or direct referral.' },

  // Track 9
  { key: 't9_social_profiles_active', track: 9, domain: 'agent', label: 'Social Business Profiles Active', description: 'Business profiles separate your personal presence from your professional brand.', doneCriterion: 'Facebook Business Page AND Instagram Business Account live with professional cover photo, contact info, and category set.' },
  { key: 't9_30_posts_published', track: 9, domain: 'agent', label: '30 Posts Published', description: 'Thirty posts establishes the habit and gives the algorithm enough signal.', doneCriterion: 'Profile grid shows ≥ 30 posts published spanning ≥ 60 days.' },
  { key: 't9_email_list_100', track: 9, domain: 'agent', label: 'Email List: 100+ Subscribers', description: 'Your email list is the only audience you own.', doneCriterion: 'Email platform shows ≥ 100 confirmed subscribers.' },
  { key: 't9_email_newsletter_sent', track: 9, domain: 'agent', label: '6 Newsletters Sent', description: 'Six sends builds the habit and provides enough data to measure engagement.', doneCriterion: 'Email platform shows ≥ 6 distinct campaign sends to ≥ 100 recipients each.' },
  { key: 't9_video_series_started', track: 9, domain: 'agent', label: 'Video Series Started (5+ Videos)', description: 'A video series — not one-offs — builds authority and discoverability over time.', doneCriterion: '≥ 5 published videos in a consistent series format. All publicly accessible.' },
  { key: 't9_500_linkedin_connections', track: 9, domain: 'agent', label: '500+ LinkedIn Connections', description: 'LinkedIn is the referral network for professional and relocation buyers.', doneCriterion: 'LinkedIn profile shows "500+" connections with professional headshot, headline, and summary.' },
  { key: 't9_local_media_feature', track: 9, domain: 'agent', label: 'Local Media Mention or Feature', description: 'Third-party media mentions are the highest-trust form of social proof.', doneCriterion: 'Published article, podcast episode, or news feature mentioning you by full name.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS MILESTONES (T10–T13, 35 total incl. 3 capstones)
// ─────────────────────────────────────────────────────────────────────────────

export const BUSINESS_MILESTONES: MilestoneMeta[] = [
  // Track 10
  { key: 't10_annual_business_plan', track: 10, domain: 'business', label: 'Annual Business Plan Written', description: 'A written plan converts intent into direction.', doneCriterion: 'One-page plan with GCI goal, unit goal, lead gen budget, and ≥ 3 priorities. Updated within 12 months.' },
  { key: 't10_weekly_kpi_tracker', track: 10, domain: 'business', label: 'Weekly KPI Tracker Active', description: 'What gets measured gets managed.', doneCriterion: 'KPI data updated for ≥ 8 consecutive weeks with no gaps.' },
  { key: 't10_time_block_schedule', track: 10, domain: 'business', label: 'Time-Block Schedule Locked', description: 'A protected schedule is the foundation of consistent lead generation.', doneCriterion: 'Written weekly schedule with ≥ 4 protected lead gen blocks in active use for ≥ 21 consecutive days.' },
  { key: 't10_sop_library_5', track: 10, domain: 'business', label: 'SOP Library: 5+ Documented Processes', description: 'SOPs make your business trainable, scalable, and survivable.', doneCriterion: '≥ 5 written SOPs in shared location, each with defined steps and assigned owner, updated within 12 months.' },
  { key: 't10_project_mgmt_tool_active', track: 10, domain: 'business', label: 'Project Management Tool in Use', description: 'A PM tool externalizes your brain and gives your team a single source of task truth.', doneCriterion: 'Active PM tool with ≥ 3 active projects/boards updated within the last 7 days.' },
  { key: 't10_80pct_admin_automated', track: 10, domain: 'business', label: '80% of Admin Tasks Automated', description: 'Automation reclaims your highest-value asset — time.', doneCriterion: 'Written audit shows ≥ 80% of recurring admin tasks handled by automation, template, or delegation.' },
  { key: 't10_ea_va_hired', track: 10, domain: 'business', label: 'EA or VA Hired (10+ hrs/week)', description: 'Your first hire is the hardest and most important leverage point.', doneCriterion: 'Signed contract showing ≥ 10 committed hours/week with ≥ 4 defined recurring responsibilities.' },
  { key: 't10_annual_business_review', track: 10, domain: 'business', label: 'Annual Business Review Completed', description: 'An annual review closes the learning loop.', doneCriterion: 'Written review covering prior year GCI vs. goal, top 3 wins, top 3 lessons, and next year priorities. Dated within 90 days of year-end.' },

  // Track 11
  { key: 't11_scripts_mastered', track: 11, domain: 'business', label: 'Core Scripts Mastered', description: 'Scripts are about having thought through every conversation in advance.', doneCriterion: 'Role-play session logged OR recorded practice for: buyer consult, listing, and ≥ 3 objection-handling scripts.' },
  { key: 't11_negotiation_training', track: 11, domain: 'business', label: 'Negotiation Training Completed', description: 'Formal negotiation training pays for itself on the first deal where you use it.', doneCriterion: 'Certificate of completion or dated session notes from a formal negotiation course.' },
  { key: 't11_conversion_by_source', track: 11, domain: 'business', label: 'Conversion Tracked by Lead Source', description: 'Knowing your conversion rate by source tells you where to invest.', doneCriterion: 'Report shows appointment-to-contract conversion rate per lead source for ≥ 90 consecutive days.' },
  { key: 't11_followup_sequences_built', track: 11, domain: 'business', label: 'Follow-Up Sequences Built (3 Types)', description: 'Different lead types need different sequences.', doneCriterion: 'Follow-up sequences for ≥ 3 distinct lead types, each with ≥ 5 defined touches and message templates.' },
  { key: 't11_avg_commission_tracked', track: 11, domain: 'business', label: 'Average Commission Per Side Tracked', description: 'Knowing your average commission lets you reverse-engineer any income goal.', doneCriterion: 'Average GCI per closed side calculated from ≥ 10 actual transactions, updated within 6 months.' },
  { key: 't11_pipeline_reviewed_weekly', track: 11, domain: 'business', label: 'Pipeline Reviewed Weekly', description: 'Weekly pipeline reviews prevent stale deals and keep your forecast honest.', doneCriterion: 'Recurring pipeline review block AND written notes for ≥ 8 consecutive weeks.' },
  { key: 't11_win_loss_review', track: 11, domain: 'business', label: 'Win/Loss Review Cadence Established', description: 'Without a win/loss review, you cannot learn from the deals you lost.', doneCriterion: 'Written review template completed for ≥ 5 distinct won or lost opportunities with root cause identified.' },
  { key: 't11_100k_gci_year', track: 11, domain: 'business', label: '$100K GCI in a Calendar Year', description: '$100K GCI is the first proof point that your business model works.', doneCriterion: 'Commission statements total ≥ $100,000 gross in a single calendar year. Verifiable via brokerage records.' },

  // Track 12
  { key: 't12_first_hire', track: 12, domain: 'business', label: 'First Hire or IC Onboarded', description: 'Your first hire changes your identity from agent to business owner.', doneCriterion: 'Signed W-2, W-9, or IC agreement on file. Individual has completed ≥ 1 assigned, documented task.' },
  { key: 't12_hiring_profile_written', track: 12, domain: 'business', label: 'Ideal Hire Profile Written', description: 'Hiring without a profile is guessing.', doneCriterion: 'Written document defines role title, top 5 required skills, cultural values fit criteria, and compensation range.' },
  { key: 't12_onboarding_checklist', track: 12, domain: 'business', label: 'Onboarding Checklist Documented', description: 'A documented onboarding checklist determines whether your next hire succeeds.', doneCriterion: 'Written checklist with ≥ 15 steps covering systems access, tool training, role clarity, and 30/60/90-day expectations.' },
  { key: 't12_11_cadence_active', track: 12, domain: 'business', label: '1:1 Coaching Cadence Active', description: 'Weekly 1:1s are the primary accountability mechanism for each team member.', doneCriterion: 'Recurring 1:1 per team member per week AND written notes for ≥ 4 consecutive sessions per team member.' },
  { key: 't12_team_values_written', track: 12, domain: 'business', label: 'Team Culture Document Written', description: 'A written culture document makes your values operational.', doneCriterion: 'Written document defines ≥ 5 team values with behavioral descriptions, shared with and acknowledged by all team members.' },
  { key: 't12_comp_structure_documented', track: 12, domain: 'business', label: 'Compensation Structure Documented', description: 'A written comp plan removes ambiguity and protects both parties.', doneCriterion: 'Written compensation plan for each role showing base/split/bonus triggers. Signed by each team member.' },
  { key: 't12_team_member_produces', track: 12, domain: 'business', label: 'Team Member Hits Productivity Benchmark', description: 'A team member who closes 12+ sides/year proves your systems can replicate your results.', doneCriterion: '≥ 1 team member closes ≥ 12 sides in a single calendar year. Verifiable via brokerage records.' },
  { key: 't12_team_revenue_exceeds_solo', track: 12, domain: 'business', label: 'Team GCI Exceeds Prior Solo Ceiling', description: 'When your team produces more than you ever did solo, leverage is working.', doneCriterion: 'Team combined GCI in any 12-month period exceeds your highest GCI year as a solo agent.' },

  // Track 13
  { key: 't13_morning_routine_30_streak', track: 13, domain: 'business', label: 'Morning Routine: 30-Day Streak', description: 'A consistent morning routine is the single highest-ROI daily habit.', doneCriterion: 'Written routine AND habit tracker shows ≥ 30 consecutive days completed without a gap.' },
  { key: 't13_annual_physical', track: 13, domain: 'business', label: 'Annual Physical Completed', description: 'Your physical health is your most important business asset.', doneCriterion: 'Doctor visit record shows a completed preventive physical within the last 12 months.' },
  { key: 't13_coach_or_mentor_engaged', track: 13, domain: 'business', label: 'Coach or Mentor Engaged', description: 'Every high performer has a coach.', doneCriterion: 'Active coaching agreement or recurring mentor calendar invite showing ≥ 1 session/month for ≥ 3 consecutive months.' },
  { key: 't13_2_week_vacation', track: 13, domain: 'business', label: '2-Week Vacation Taken', description: 'A 2-week vacation is a stress test of your systems.', doneCriterion: 'Calendar shows ≥ 10 consecutive business days off with evidence that GCI activities continued without owner.' },
  { key: 't13_business_runs_without_owner', track: 13, domain: 'business', label: 'Business Runs 5 Days Without Owner', description: 'The test of a real business: can it operate when you are not there?', doneCriterion: 'Documented 5-consecutive-business-day period where owner was absent AND ≥ 1 revenue-generating activity occurred.' },
  { key: 't13_reading_habit_6mo', track: 13, domain: 'business', label: 'Reading Habit: 1 Book/Month for 6 Months', description: 'Leaders are readers.', doneCriterion: 'Book log shows ≥ 6 distinct books completed across 6 consecutive calendar months.' },
  { key: 't13_personal_vision_written', track: 13, domain: 'business', label: 'Personal Vision & Values Written', description: 'A written personal vision is the North Star that prevents you from succeeding at the wrong things.', doneCriterion: 'Written document of ≥ 1 page defining: personal core values (≥ 5), 10-year life vision, and personal definition of success.' },
  { key: 't13_sabbath_protected', track: 13, domain: 'business', label: 'Weekly Recovery Practice Protected', description: 'Sustained high performance requires deliberate recovery.', doneCriterion: 'Recurring full-day or equivalent recovery block per week maintained for ≥ 30 consecutive days.' },

  // Stretch Capstones
  { key: 't13_250k_gci_year', track: 13, domain: 'business', isCapstone: true, label: '$250K GCI in a Calendar Year', description: '$250K GCI puts you in the top tier of individual agent producers.', doneCriterion: 'Commission statements total ≥ $250,000 gross in a single calendar year. Verifiable via brokerage records.' },
  { key: 't13_property_cash_flow_positive', track: 13, domain: 'business', isCapstone: true, label: 'Investment Property Cash Flow Positive', description: 'A cash-flowing property proves your real estate knowledge is creating wealth.', doneCriterion: 'Monthly income/expense statement for ≥ 1 investment property shows positive net cash flow for ≥ 3 consecutive months.' },
  { key: 't13_business_30_day_absence', track: 13, domain: 'business', isCapstone: true, label: 'Business Operates 30 Days Without Owner', description: 'Thirty days of owner absence with revenue continuing is the proof of a true enterprise.', doneCriterion: 'Documented 30-consecutive-day period where owner was absent AND team produced ≥ 1 closed transaction without owner involvement.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getMilestonesByTrack(
  milestones: MilestoneMeta[],
  track: number
): MilestoneMeta[] {
  return milestones.filter(m => m.track === track);
}

export function computeTrackProgress(
  milestones: MilestoneMeta[],
  completions: Array<{ milestoneKey: string; status: string | null }>,
  track: number
): { done: number; total: number; pct: number } {
  const trackMilestones = getMilestonesByTrack(milestones, track);
  const done = trackMilestones.filter(m =>
    completions.some(c => c.milestoneKey === m.key && c.status === 'done')
  ).length;
  return { done, total: trackMilestones.length, pct: Math.round((done / trackMilestones.length) * 100) };
}

export function isTrackUnlocked(
  domain: 'agent' | 'business',
  track: number,
  completions: Array<{ milestoneKey: string; status: string | null }>
): boolean {
  const milestones = domain === 'agent' ? AGENT_MILESTONES : BUSINESS_MILESTONES;

  if (domain === 'agent') {
    if (track === 6) return true;
    const prevTrack = track - 1;
    const prevDone = getMilestonesByTrack(milestones, prevTrack)
      .filter(m => completions.some(c => c.milestoneKey === m.key && c.status === 'done')).length;
    return prevDone >= 4;
  }

  // business domain
  if (track === 10) return true;
  if (track === 11) {
    const t10Done = getMilestonesByTrack(milestones, 10)
      .filter(m => completions.some(c => c.milestoneKey === m.key && c.status === 'done')).length;
    return t10Done >= 4;
  }
  if (track === 12) {
    const t11Done = getMilestonesByTrack(milestones, 11)
      .filter(m => completions.some(c => c.milestoneKey === m.key && c.status === 'done')).length;
    const has100k = completions.some(c => c.milestoneKey === 't11_100k_gci_year' && c.status === 'done');
    return t11Done >= 4 && has100k;
  }
  if (track === 13) {
    const t12Done = getMilestonesByTrack(milestones, 12)
      .filter(m => completions.some(c => c.milestoneKey === m.key && c.status === 'done')).length;
    return t12Done >= 4;
  }
  return false;
}
