// client/src/lib/wealthConstants.ts
// Mirrors server/wealth/milestoneKeys.ts for frontend use

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

export const MILESTONE_META: Record<string, { label: string; description: string; track: number }> = {
  // Track 1
  t1_business_checking: { track: 1, label: 'Business Checking Account', description: 'Separate business and personal finances with a dedicated business checking account.' },
  t1_business_credit_card: { track: 1, label: 'Business Credit Card', description: 'Establish a business credit card for all business expenses.' },
  t1_eo_umbrella_insurance: { track: 1, label: 'E&O + Umbrella Insurance', description: 'Secure Errors & Omissions and umbrella liability coverage.' },
  t1_emergency_fund_3mo: { track: 1, label: '3-Month Emergency Fund', description: 'Build 3 months of personal living expenses in liquid savings.' },
  t1_operating_reserve_1mo: { track: 1, label: '1-Month Operating Reserve', description: 'Maintain 1 month of business operating expenses in reserve.' },
  t1_beneficiary_designations: { track: 1, label: 'Beneficiary Designations', description: 'Update all financial accounts with current beneficiary designations.' },
  t1_basic_will: { track: 1, label: 'Basic Will', description: 'Execute a basic will with an estate attorney.' },
  // Track 2
  t2_llc_formed: { track: 2, label: 'LLC Formed', description: 'Form an LLC to separate personal and business liability.' },
  t2_operating_agreement: { track: 2, label: 'Operating Agreement', description: 'Draft and execute a formal LLC operating agreement.' },
  t2_scorp_2553: { track: 2, label: 'S-Corp Election (Form 2553)', description: 'File IRS Form 2553 to elect S-Corp tax treatment for your LLC.' },
  t2_cpa_hired: { track: 2, label: 'CPA Hired', description: 'Engage a CPA experienced with real estate agent taxation.' },
  t2_accounting_software: { track: 2, label: 'Accounting Software', description: 'Set up QuickBooks, Wave, or equivalent for business bookkeeping.' },
  t2_quarterly_est_tax: { track: 2, label: 'Quarterly Estimated Taxes', description: 'Establish a system for paying quarterly estimated taxes on time.' },
  // Track 3
  t3_sep_ira: { track: 3, label: 'SEP-IRA Opened', description: 'Open a SEP-IRA and begin contributing up to 25% of net self-employment income.' },
  t3_scorp_salary_optimized: { track: 3, label: 'S-Corp Salary Optimized', description: 'Work with your CPA to set a reasonable salary to minimize self-employment tax.' },
  t3_home_office_deduction: { track: 3, label: 'Home Office Deduction', description: 'Document and claim the home office deduction with your CPA.' },
  t3_vehicle_strategy: { track: 3, label: 'Vehicle Strategy', description: 'Implement a vehicle deduction strategy (actual expense or standard mileage).' },
  t3_health_ins_deduction: { track: 3, label: 'Health Insurance Deduction', description: 'Deduct self-employed health insurance premiums through your S-Corp.' },
  t3_wealth_allocation_system: { track: 3, label: 'Wealth Allocation System', description: 'Implement a system to allocate every commission check: tithe, tax, operating, savings.' },
  t3_roth_ira: { track: 3, label: 'Roth IRA Opened', description: 'Open and fund a Roth IRA for tax-free retirement growth.' },
  // Track 4
  t4_fi_number_defined: { track: 4, label: 'FI Number Defined', description: 'Calculate your Financial Independence number (annual expenses × 25).' },
  t4_savings_rate_target: { track: 4, label: 'Savings Rate Target Set', description: 'Commit to a specific savings rate percentage of gross income.' },
  t4_term_life_insurance: { track: 4, label: 'Term Life Insurance', description: 'Purchase adequate term life insurance to protect your family.' },
  t4_first_investment_property: { track: 4, label: 'First Investment Property', description: 'Acquire your first rental or investment property.' },
  t4_index_fund_dca: { track: 4, label: 'Index Fund DCA', description: 'Set up automatic dollar-cost averaging into low-cost index funds.' },
  t4_passive_income_covers_expenses: { track: 4, label: 'Passive Income Covers Expenses', description: 'Reach the milestone where passive income covers all monthly living expenses.' },
  t4_giving_structure: { track: 4, label: 'Giving Structure', description: 'Establish a formal giving structure (DAF, tithe account, or foundation).' },
  // Track 5
  t5_portfolio_income_50pct: { track: 5, label: 'Portfolio Income 50%+', description: 'Portfolio/passive income exceeds 50% of total income.' },
  t5_living_trust: { track: 5, label: 'Living Trust', description: 'Establish a revocable living trust with an estate attorney.' },
  t5_investment_portfolio_5units: { track: 5, label: '5+ Investment Properties', description: 'Own and operate a portfolio of 5 or more investment properties.' },
  t5_fee_only_advisor: { track: 5, label: 'Fee-Only Financial Advisor', description: 'Engage a fee-only fiduciary financial advisor for portfolio management.' },
  t5_fi_date_targeted: { track: 5, label: 'FI Date Targeted', description: 'Set a specific target date for achieving Financial Independence.' },
  t5_legacy_transfer_plan: { track: 5, label: 'Legacy Transfer Plan', description: 'Complete a comprehensive legacy and wealth transfer plan with your estate attorney.' },
};
