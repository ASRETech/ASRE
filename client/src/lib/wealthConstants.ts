// client/src/lib/wealthConstants.ts
// Mirrors server/wealth/milestoneKeys.ts for frontend use
// Sprint D: Added whyItMatters and firstStep for all 33 milestones

export const TRACK_MILESTONE_COUNTS: Record<number, number> = {
  1: 7, 2: 6, 3: 7, 4: 7, 5: 6,
};

export const TRACK_NAMES: Record<number, string> = {
  1: 'Foundation',
  2: 'Business Structure',
  3: 'Tax Optimization',
  4: 'Wealth Building',
  5: 'Legacy & FI',
};

export interface MilestoneMeta {
  label: string;
  description: string;
  track: number;
  whyItMatters: string;
  firstStep: string;
}

export const MILESTONE_META: Record<string, MilestoneMeta> = {
  // ── TRACK 1: Foundation ──
  t1_business_checking: {
    track: 1,
    label: 'Business Checking Account',
    description: 'Separate business and personal finances with a dedicated business checking account.',
    whyItMatters: 'Mixing personal and business money is the #1 mistake new agents make. A separate account makes taxes cleaner, protects your LLC liability shield, and gives you a real picture of business cash flow.',
    firstStep: 'Open a free business checking account at your current bank or a credit union. Bring your LLC docs (or just your name/EIN if sole prop). Takes 20 minutes.',
  },
  t1_business_credit_card: {
    track: 1,
    label: 'Business Credit Card',
    description: 'Establish a business credit card for all business expenses.',
    whyItMatters: 'A dedicated business card auto-categorizes every deductible expense, builds business credit history, and earns rewards on money you\'re already spending. It also creates a clean audit trail for your CPA.',
    firstStep: 'Apply for a no-annual-fee business card (Chase Ink Cash or Capital One Spark Cash are popular). Use it exclusively for business purchases starting today.',
  },
  t1_eo_umbrella_insurance: {
    track: 1,
    label: 'E&O + Umbrella Insurance',
    description: 'Secure Errors & Omissions and umbrella liability coverage.',
    whyItMatters: 'One lawsuit can erase years of income. E&O covers professional mistakes; umbrella covers everything your standard policies don\'t. This is the cheapest risk transfer you can buy.',
    firstStep: 'Call your current insurance agent and ask for a quote on a $1M umbrella policy (usually $150-300/year). Verify your brokerage\'s E&O coverage and confirm your personal coverage.',
  },
  t1_emergency_fund_3mo: {
    track: 1,
    label: '3-Month Emergency Fund',
    description: 'Build 3 months of personal living expenses in liquid savings.',
    whyItMatters: 'Commission income is lumpy. A 3-month cushion means a slow quarter doesn\'t force you into bad decisions — taking low-quality clients, skipping marketing, or going into debt.',
    firstStep: 'Calculate your monthly living expenses. Open a high-yield savings account (Marcus, Ally, or similar). Set up an automatic transfer of $X per commission check until you hit the target.',
  },
  t1_operating_reserve_1mo: {
    track: 1,
    label: '1-Month Operating Reserve',
    description: 'Maintain 1 month of business operating expenses in reserve.',
    whyItMatters: 'Your business has fixed costs (MLS fees, marketing, tools) that don\'t pause when deals fall through. A reserve keeps the engine running without dipping into personal savings.',
    firstStep: 'Add up your monthly business fixed costs. Keep that amount in your business checking as a floor — never spend below it. Replenish it first when a commission hits.',
  },
  t1_beneficiary_designations: {
    track: 1,
    label: 'Beneficiary Designations',
    description: 'Update all financial accounts with current beneficiary designations.',
    whyItMatters: 'Beneficiary designations override your will. An outdated designation (ex-spouse, deceased parent) can send your life savings to the wrong person — and courts can\'t fix it.',
    firstStep: 'Log into every financial account (bank, 401k, IRA, life insurance) and verify the beneficiary. Update any that are wrong or blank. Takes 30 minutes and could save your family years of legal headaches.',
  },
  t1_basic_will: {
    track: 1,
    label: 'Basic Will',
    description: 'Execute a basic will with an estate attorney.',
    whyItMatters: 'Without a will, the state decides who gets your assets and who raises your children. A basic will is one of the most loving things you can do for your family — and it\'s not expensive.',
    firstStep: 'Search your state bar\'s referral service for an estate attorney. A basic will package typically costs $300-800. Schedule a consultation and bring a list of your assets and who you want to receive them.',
  },

  // ── TRACK 2: Business Structure ──
  t2_llc_formed: {
    track: 2,
    label: 'LLC Formed',
    description: 'Form an LLC to separate personal and business liability.',
    whyItMatters: 'An LLC creates a legal wall between your personal assets (home, savings, car) and your business liabilities. Without it, a business lawsuit can reach everything you own.',
    firstStep: 'File Articles of Organization with your state\'s Secretary of State (usually $50-200). Use your state\'s website directly or a service like Northwest Registered Agent. Then get an EIN from IRS.gov (free, 5 minutes).',
  },
  t2_operating_agreement: {
    track: 2,
    label: 'Operating Agreement',
    description: 'Draft and execute a formal LLC operating agreement.',
    whyItMatters: 'Without an operating agreement, courts may ignore your LLC\'s liability protection. It also governs what happens if you add a partner, need to dissolve, or face a dispute.',
    firstStep: 'Ask your estate or business attorney to draft a single-member LLC operating agreement. Many attorneys include this with LLC formation. Sign and date it — keep it with your LLC records.',
  },
  t2_scorp_2553: {
    track: 2,
    label: 'S-Corp Election (Form 2553)',
    description: 'File IRS Form 2553 to elect S-Corp tax treatment for your LLC.',
    whyItMatters: 'At $80K+ net income, an S-Corp election can save $5,000-15,000/year in self-employment taxes by splitting income between salary and distributions. This is the single highest-ROI tax move for most agents.',
    firstStep: 'Talk to your CPA first — they need to confirm your income level justifies the S-Corp costs. If it does, file Form 2553 with the IRS (free). Your CPA can handle this in one meeting.',
  },
  t2_cpa_hired: {
    track: 2,
    label: 'CPA Hired',
    description: 'Engage a CPA experienced with real estate agent taxation.',
    whyItMatters: 'A real estate-savvy CPA pays for themselves many times over. They know the deductions you\'re missing, structure your S-Corp salary correctly, and keep you out of audit trouble.',
    firstStep: 'Ask your top-producing agent contacts for their CPA referral. Look for someone who works with self-employed real estate professionals specifically. Interview 2-3 before choosing.',
  },
  t2_accounting_software: {
    track: 2,
    label: 'Accounting Software',
    description: 'Set up QuickBooks, Wave, or equivalent for business bookkeeping.',
    whyItMatters: 'Real-time P&L visibility lets you make better business decisions. It also makes tax prep faster and cheaper — your CPA charges by the hour, and clean books save hours.',
    firstStep: 'Set up QuickBooks Self-Employed (simplest) or QuickBooks Online Simple Start. Connect your business checking and credit card. Categorize the last 90 days of transactions in one sitting.',
  },
  t2_quarterly_est_tax: {
    track: 2,
    label: 'Quarterly Estimated Taxes',
    description: 'Establish a system for paying quarterly estimated taxes on time.',
    whyItMatters: 'Missing quarterly payments triggers IRS penalties and interest. More importantly, agents who don\'t set aside taxes often face a devastating tax bill in April that wipes out their savings.',
    firstStep: 'Ask your CPA for your estimated quarterly payment amounts. Set up IRS Direct Pay at irs.gov/payments. Calendar the 4 due dates: April 15, June 15, Sept 15, Jan 15. Automate if possible.',
  },

  // ── TRACK 3: Tax Optimization ──
  t3_sep_ira: {
    track: 3,
    label: 'SEP-IRA Opened',
    description: 'Open a SEP-IRA and begin contributing up to 25% of net self-employment income.',
    whyItMatters: 'A SEP-IRA lets you contribute up to $66,000/year (2024) — reducing your taxable income dollar-for-dollar. It\'s the most powerful retirement account available to self-employed agents.',
    firstStep: 'Open a SEP-IRA at Fidelity, Vanguard, or Schwab (free, takes 15 minutes online). Contribute before your tax filing deadline. Ask your CPA how much to contribute to maximize the deduction.',
  },
  t3_scorp_salary_optimized: {
    track: 3,
    label: 'S-Corp Salary Optimized',
    description: 'Work with your CPA to set a reasonable salary to minimize self-employment tax.',
    whyItMatters: 'The IRS requires a "reasonable salary" from your S-Corp — but reasonable is a range. Setting it at the right level (not too high, not too low) can save thousands in SE tax annually.',
    firstStep: 'Schedule a meeting with your CPA specifically to review your S-Corp salary. Bring your last 12 months of gross commission income. They\'ll model the optimal salary based on your income level.',
  },
  t3_home_office_deduction: {
    track: 3,
    label: 'Home Office Deduction',
    description: 'Document and claim the home office deduction with your CPA.',
    whyItMatters: 'If you use a dedicated space in your home exclusively for business, you can deduct a proportional share of rent/mortgage, utilities, and internet. Most agents leave this on the table.',
    firstStep: 'Measure your dedicated office space in square feet. Divide by your home\'s total square footage. That percentage applies to deductible home expenses. Tell your CPA and let them calculate the deduction.',
  },
  t3_vehicle_strategy: {
    track: 3,
    label: 'Vehicle Strategy',
    description: 'Implement a vehicle deduction strategy (actual expense or standard mileage).',
    whyItMatters: 'Real estate agents drive constantly. Whether you use actual expenses or standard mileage, a documented vehicle strategy can generate $5,000-15,000+ in annual deductions.',
    firstStep: 'Start tracking every business mile today using MileIQ or a simple mileage log. Tell your CPA your annual mileage estimate. They\'ll determine whether actual expenses or standard mileage is better for your situation.',
  },
  t3_health_ins_deduction: {
    track: 3,
    label: 'Health Insurance Deduction',
    description: 'Deduct self-employed health insurance premiums through your S-Corp.',
    whyItMatters: 'Self-employed agents can deduct 100% of health insurance premiums. Routing it through your S-Corp correctly can also reduce your SE tax base — a double benefit.',
    firstStep: 'Confirm with your CPA that your health insurance is being deducted correctly on your return. If you have an S-Corp, the premium should be added to your W-2 wages and then deducted on Schedule 1.',
  },
  t3_wealth_allocation_system: {
    track: 3,
    label: 'Wealth Allocation System',
    description: 'Implement a system to allocate every commission check: tithe, tax, operating, savings.',
    whyItMatters: 'Without a system, commission income gets spent reactively. A pre-committed allocation (e.g., 10% tithe, 25% tax, 15% savings, 50% operating) turns variable income into predictable wealth building.',
    firstStep: 'Define your percentages. The day your next commission hits, manually split it according to your allocation. Then set up automatic transfers to make it effortless going forward.',
  },
  t3_roth_ira: {
    track: 3,
    label: 'Roth IRA Opened',
    description: 'Open and fund a Roth IRA for tax-free retirement growth.',
    whyItMatters: 'Roth contributions grow tax-free and are withdrawn tax-free in retirement. For agents in lower-income years, this is the best time to contribute — you pay taxes now at a lower rate.',
    firstStep: 'Open a Roth IRA at Fidelity, Vanguard, or Schwab (free). Contribute up to $7,000/year ($8,000 if 50+). Invest in a target-date fund or total market index fund to start.',
  },

  // ── TRACK 4: Wealth Building ──
  t4_fi_number_defined: {
    track: 4,
    label: 'FI Number Defined',
    description: 'Calculate your Financial Independence number (annual expenses × 25).',
    whyItMatters: 'You can\'t hit a target you can\'t see. Your FI number (annual expenses × 25) is the portfolio size that generates enough passive income to cover your life indefinitely. Knowing it makes every savings decision concrete.',
    firstStep: 'Add up your annual living expenses. Multiply by 25. That\'s your FI number. Enter it in the FI Calculator tab. Then work backward: how much do you need to save each month to hit it in your target timeframe?',
  },
  t4_savings_rate_target: {
    track: 4,
    label: 'Savings Rate Target Set',
    description: 'Commit to a specific savings rate percentage of gross income.',
    whyItMatters: 'Savings rate is the single most powerful lever in wealth building — more than investment returns. A 20% savings rate reaches FI in ~37 years; 50% gets there in ~17 years.',
    firstStep: 'Calculate what percentage of your gross income you saved last year. Set a target that\'s 5% higher. Automate the transfer so it happens before you can spend it.',
  },
  t4_term_life_insurance: {
    track: 4,
    label: 'Term Life Insurance',
    description: 'Purchase adequate term life insurance to protect your family.',
    whyItMatters: 'If you\'re building wealth for your family, you need to protect the income stream that funds it. Term life is the most cost-effective way to replace your income if you die before reaching FI.',
    firstStep: 'Get quotes for a 20-year level term policy equal to 10-12x your annual income. Use Policygenius or contact an independent insurance broker. Healthy agents in their 30s-40s can get $1M coverage for $50-100/month.',
  },
  t4_first_investment_property: {
    track: 4,
    label: 'First Investment Property',
    description: 'Acquire your first rental or investment property.',
    whyItMatters: 'Real estate agents have an unfair advantage in investment property — you see deals first, understand markets deeply, and pay no buyer\'s agent commission. Your first property starts the compounding engine.',
    firstStep: 'Define your buy-box: price range, target cash-on-cash return (aim for 8%+), and market. Run the numbers on 10 properties before making an offer. Your first deal teaches you more than any book.',
  },
  t4_index_fund_dca: {
    track: 4,
    label: 'Index Fund DCA',
    description: 'Set up automatic dollar-cost averaging into low-cost index funds.',
    whyItMatters: 'Index funds outperform 90%+ of actively managed funds over 20 years. Automatic DCA removes emotion from investing and ensures you buy more shares when prices are low.',
    firstStep: 'Set up automatic monthly investments in a total market index fund (VTI, FSKAX, or SWTSX) inside your brokerage account. Start with whatever amount you can commit to consistently — even $200/month compounds significantly.',
  },
  t4_passive_income_covers_expenses: {
    track: 4,
    label: 'Passive Income Covers Expenses',
    description: 'Reach the milestone where passive income covers all monthly living expenses.',
    whyItMatters: 'This is the definition of financial freedom — the point where work becomes optional. Every dollar of passive income you build reduces your dependence on commission income.',
    firstStep: 'Calculate your current monthly passive income (rental cash flow + dividends + interest). Calculate your monthly expenses. Track the gap monthly. Celebrate every $100 of new passive income you create.',
  },
  t4_giving_structure: {
    track: 4,
    label: 'Giving Structure',
    description: 'Establish a formal giving structure (DAF, tithe account, or foundation).',
    whyItMatters: 'A formal giving structure makes generosity systematic, maximizes tax efficiency, and aligns your wealth with your values. It also models stewardship for your family.',
    firstStep: 'Open a Donor-Advised Fund at Fidelity Charitable or Schwab Charitable (free, $5,000 minimum). Or simply open a dedicated savings account labeled "Giving" and fund it with your tithe percentage each month.',
  },

  // ── TRACK 5: Legacy & FI ──
  t5_portfolio_income_50pct: {
    track: 5,
    label: 'Portfolio Income 50%+',
    description: 'Portfolio/passive income exceeds 50% of total income.',
    whyItMatters: 'When passive income is half your total income, you\'ve fundamentally shifted your economic model. You\'re no longer fully dependent on trading time for money — your assets are doing the heavy lifting.',
    firstStep: 'Calculate your last 12 months of passive income (rentals, dividends, interest, royalties). Divide by total income. Track this ratio quarterly. Every new asset you acquire moves the needle.',
  },
  t5_living_trust: {
    track: 5,
    label: 'Living Trust',
    description: 'Establish a revocable living trust with an estate attorney.',
    whyItMatters: 'A living trust avoids probate (which is public, slow, and expensive), allows seamless asset transfer at death, and can include provisions for incapacity. At your wealth level, it\'s essential.',
    firstStep: 'Engage an estate attorney to draft a revocable living trust. Budget $1,500-3,000 for a comprehensive trust package. Then "fund" the trust by retitling your assets (real estate, accounts) into the trust\'s name.',
  },
  t5_investment_portfolio_5units: {
    track: 5,
    label: '5+ Investment Properties',
    description: 'Own and operate a portfolio of 5 or more investment properties.',
    whyItMatters: 'Five properties creates meaningful passive income diversification, qualifies you for portfolio lending, and positions you for professional real estate investor status with significant tax advantages.',
    firstStep: 'Map your path from your current property count to 5. Model the cash flow and equity growth of each acquisition. Consider a HELOC on existing properties to fund down payments on new ones.',
  },
  t5_fee_only_advisor: {
    track: 5,
    label: 'Fee-Only Financial Advisor',
    description: 'Engage a fee-only fiduciary financial advisor for portfolio management.',
    whyItMatters: 'At this wealth level, a fee-only fiduciary (who earns no commissions) provides objective guidance on asset allocation, tax-loss harvesting, and withdrawal strategies that can add 1-2% annually to your returns.',
    firstStep: 'Search NAPFA.org or Garrett Planning Network for a fee-only fiduciary advisor in your area. Interview 2-3. Ask specifically: "Are you a fiduciary 100% of the time?" and "How are you compensated?"',
  },
  t5_fi_date_targeted: {
    track: 5,
    label: 'FI Date Targeted',
    description: 'Set a specific target date for achieving Financial Independence.',
    whyItMatters: 'A specific FI date transforms a vague aspiration into an engineering problem. It tells you exactly how much you need to save each month, what return you need, and whether your current trajectory gets you there.',
    firstStep: 'Use the FI Calculator to model your current trajectory. Adjust savings rate and expected return to find a date that\'s ambitious but achievable. Write the date down and put it somewhere you see daily.',
  },
  t5_legacy_transfer_plan: {
    track: 5,
    label: 'Legacy Transfer Plan',
    description: 'Complete a comprehensive legacy and wealth transfer plan with your estate attorney.',
    whyItMatters: 'Without a plan, your estate may face unnecessary taxes, family conflict, and probate delays. A comprehensive plan ensures your wealth transfers according to your values — not the state\'s default rules.',
    firstStep: 'Schedule a comprehensive estate planning review with your attorney. Bring your trust, will, beneficiary designations, and a list of all assets. Ask about irrevocable trusts, charitable strategies, and generational transfer options.',
  },
};
