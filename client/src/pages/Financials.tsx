// Screen 7: Financials — PROGRESSIVE P&L
// Design: "Command Center" — Commission calculator + Profit First allocation + P&L
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, Calculator, PieChart, TrendingUp,
  ArrowUpRight, ArrowDownRight, Target, BarChart3,
  FileDown, Upload, Loader2, Trash2, Tag
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Financials() {
  const { state } = useApp();
  const financials = state.financials;

  // Commission Calculator state
  const [salePrice, setSalePrice] = useState(350000);
  const [commissionPct, setCommissionPct] = useState(3);
  const [agentSplit, setAgentSplit] = useState(75);
  const [fees, setFees] = useState(500);

  // Profit First allocation percentages
  const [allocations, setAllocations] = useState({
    taxes: 21,
    giving: 10,
    operating: 15,
    ownerPay: 30,
    profitSavings: 14,
    investment: 10,
  });

  // Commission calculations
  const grossCommission = salePrice * (commissionPct / 100);
  const afterSplit = grossCommission * (agentSplit / 100);
  const afterFees = afterSplit - fees;
  const taxReserve = afterFees * (allocations.taxes / 100);
  const giving = afterFees * (allocations.giving / 100);
  const netDeposit = afterFees - taxReserve - giving;

  // Profit First breakdown
  const pfBreakdown = [
    { label: 'Taxes', pct: allocations.taxes, amount: afterFees * (allocations.taxes / 100), color: 'bg-red-500' },
    { label: 'Giving', pct: allocations.giving, amount: afterFees * (allocations.giving / 100), color: 'bg-violet-500' },
    { label: 'Operating', pct: allocations.operating, amount: afterFees * (allocations.operating / 100), color: 'bg-blue-500' },
    { label: 'Owner Pay', pct: allocations.ownerPay, amount: afterFees * (allocations.ownerPay / 100), color: 'bg-emerald-500' },
    { label: 'Profit/Savings', pct: allocations.profitSavings, amount: afterFees * (allocations.profitSavings / 100), color: 'bg-amber-500' },
    { label: 'Investment', pct: allocations.investment, amount: afterFees * (allocations.investment / 100), color: 'bg-cyan-500' },
  ];

  // P&L data
  const totalIncome = financials.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpenses = financials.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    financials.filter(f => f.type === 'expense').forEach(f => {
      cats[f.category] = (cats[f.category] || 0) + f.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [financials]);

  const incomeByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    financials.filter(f => f.type === 'income').forEach(f => {
      cats[f.category] = (cats[f.category] || 0) + f.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [financials]);

  // Effective hourly rate
  const hoursPerWeek = 50;
  const weeksWorked = 48;
  const effectiveHourly = netIncome / (hoursPerWeek * weeksWorked);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">YTD GCI</div>
            <div className="font-mono text-xl font-bold text-foreground">${totalIncome.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">YTD Expenses</div>
            <div className="font-mono text-xl font-bold text-foreground">${totalExpenses.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">YTD Net</div>
            <div className={`font-mono text-xl font-bold ${netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ${netIncome.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Effective Hourly</div>
            <div className="font-mono text-xl font-bold text-foreground">${effectiveHourly.toFixed(2)}</div>
          </Card>
        </div>

        <Tabs defaultValue="calculator" className="space-y-4">
          <TabsList className="bg-muted/50 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="calculator" className="text-xs flex-1 sm:flex-initial">Calculator</TabsTrigger>
            <TabsTrigger value="profitfirst" className="text-xs flex-1 sm:flex-initial">Profit First</TabsTrigger>
            <TabsTrigger value="pnl" className="text-xs flex-1 sm:flex-initial">P&L</TabsTrigger>
            <TabsTrigger value="model" className="text-xs flex-1 sm:flex-initial">Economic Model</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs flex-1 sm:flex-initial">90-Day Forecast</TabsTrigger>
            <TabsTrigger value="taxexport" className="text-xs flex-1 sm:flex-initial">Tax Export &amp; Integrations</TabsTrigger>
          </TabsList>

          {/* Commission Calculator */}
          <TabsContent value="calculator">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#DC143C]" />
                  Commission Calculator
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sale Price</Label>
                      <span className="font-mono text-sm font-semibold">${salePrice.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[salePrice]}
                      onValueChange={([v]) => setSalePrice(v)}
                      min={100000}
                      max={2000000}
                      step={10000}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                      <span>$100K</span><span>$2M</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Commission %</Label>
                      <Input
                        type="number"
                        value={commissionPct}
                        onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 0)}
                        className="h-9 font-mono"
                        step={0.5}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Agent Split %</Label>
                      <Input
                        type="number"
                        value={agentSplit}
                        onChange={(e) => setAgentSplit(parseFloat(e.target.value) || 0)}
                        className="h-9 font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Fees</Label>
                      <Input
                        type="number"
                        value={fees}
                        onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                        className="h-9 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Live output */}
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Gross Commission</div>
                  <div className="font-mono text-xl font-bold">${grossCommission.toLocaleString()}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">After Split ({agentSplit}%)</div>
                  <div className="font-mono text-xl font-bold">${afterSplit.toLocaleString()}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">After Fees</div>
                  <div className="font-mono text-xl font-bold">${afterFees.toLocaleString()}</div>
                </Card>
                <Card className="p-4 border-[#DC143C]/20 bg-[#DC143C]/[0.02]">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tax Reserve ({allocations.taxes}%)</div>
                  <div className="font-mono text-lg font-bold text-red-500">-${taxReserve.toLocaleString()}</div>
                </Card>
                <Card className="p-4 border-violet-500/20 bg-violet-500/[0.02]">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Giving ({allocations.giving}%)</div>
                  <div className="font-mono text-lg font-bold text-violet-500">-${giving.toLocaleString()}</div>
                </Card>
                <Card className="p-4 border-emerald-500/20 bg-emerald-500/[0.02]">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Net Deposit</div>
                  <div className="font-mono text-2xl font-bold text-emerald-500">${netDeposit.toLocaleString()}</div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Profit First */}
          <TabsContent value="profitfirst">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#DC143C]" />
                Profit First Allocation
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Based on a ${afterFees.toLocaleString()} net commission (after split and fees).
              </p>

              {/* Visual allocation bar */}
              <div className="h-8 rounded-lg overflow-hidden flex mb-6">
                {pfBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className={`${item.color} flex items-center justify-center transition-all`}
                    style={{ width: `${item.pct}%` }}
                  >
                    <span className="text-[9px] font-mono text-white font-bold">{item.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Allocation details */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pfBreakdown.map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-auto">{item.pct}%</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-foreground">
                      ${Math.round(item.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* P&L Statement */}
          <TabsContent value="pnl">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Income */}
              <Card className="p-6">
                <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  Income
                </h3>
                <div className="space-y-2">
                  {incomeByCategory.map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm text-foreground">{cat}</span>
                      <span className="font-mono text-sm font-semibold text-emerald-500">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 font-semibold">
                    <span className="text-sm">Total Income</span>
                    <span className="font-mono text-base text-emerald-500">${totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Expenses */}
              <Card className="p-6">
                <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-foreground" />
                  Expenses
                </h3>
                <div className="space-y-2">
                  {expensesByCategory.map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm text-foreground">{cat}</span>
                      <span className="font-mono text-sm text-foreground">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 font-semibold">
                    <span className="text-sm">Total Expenses</span>
                    <span className="font-mono text-base text-foreground">${totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Net */}
              <Card className="p-6 lg:col-span-2 border-[#DC143C]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Operating Income</div>
                    <div className={`font-mono text-3xl font-bold ${netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${netIncome.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Profit Margin</div>
                    <div className="font-mono text-xl font-bold text-foreground">
                      {totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Economic Model — MREA Reverse-Engineered Income */}
          <TabsContent value="model">
            <EconomicModelTab gciGoal={state.user?.incomeGoal ?? 250000} />
          </TabsContent>

          {/* 90-Day Cash Flow Forecast */}
          <TabsContent value="forecast">
            <ForecastTab financials={financials} gciGoal={state.user?.incomeGoal ?? 250000} />
          </TabsContent>

          {/* Receipt Capture */}

          {/* Tax Export */}
          <TabsContent value="taxexport">
            <TaxExportTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Economic Model (MREA Reverse-Engineered) ───────────────────────
function EconomicModelTab({ gciGoal }: { gciGoal: number }) {
  const [avgPrice, setAvgPrice] = useState(350000);
  const [avgCommPct, setAvgCommPct] = useState(2.8);
  const [splitPct, setSplitPct] = useState(75);
  const [leadConvRate, setLeadConvRate] = useState(3);
  const [apptConvRate, setApptConvRate] = useState(40);

  const avgGCI = avgPrice * (avgCommPct / 100) * (splitPct / 100);
  const txNeeded = avgGCI > 0 ? Math.ceil(gciGoal / avgGCI) : 0;
  const apptsNeeded = apptConvRate > 0 ? Math.ceil(txNeeded / (apptConvRate / 100)) : 0;
  const leadsNeeded = leadConvRate > 0 ? Math.ceil(txNeeded / (leadConvRate / 100)) : 0;
  const monthlyLeads = Math.ceil(leadsNeeded / 12);
  const weeklyContacts = Math.ceil(monthlyLeads / 4);
  const dailyContacts = Math.ceil(weeklyContacts / 5);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#DC143C]" /> MREA Economic Model
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Reverse-engineer your income goal into daily activities. Adjust the inputs to match your market.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'GCI Goal', value: gciGoal, prefix: '$', readOnly: true },
            { label: 'Avg Sale Price', value: avgPrice, setter: setAvgPrice, prefix: '$' },
            { label: 'Avg Commission %', value: avgCommPct, setter: setAvgCommPct, suffix: '%', step: 0.1 },
            { label: 'Agent Split %', value: splitPct, setter: setSplitPct, suffix: '%' },
            { label: 'Lead-to-Close %', value: leadConvRate, setter: setLeadConvRate, suffix: '%' },
            { label: 'Appt-to-Close %', value: apptConvRate, setter: setApptConvRate, suffix: '%' },
          ].map(item => (
            <div key={item.label}>
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">{item.label}</Label>
              <div className="relative">
                {item.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{item.prefix}</span>}
                <Input
                  type="number"
                  value={item.value}
                  onChange={e => item.setter?.(parseFloat(e.target.value) || 0)}
                  readOnly={item.readOnly}
                  step={item.step || 1}
                  className={`h-9 font-mono text-sm ${item.prefix ? 'pl-7' : ''} ${item.readOnly ? 'bg-muted/50' : ''}`}
                />
                {item.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{item.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Results waterfall */}
      <Card className="p-6">
        <h4 className="font-display text-sm font-semibold mb-4">Reverse-Engineered Activity Plan</h4>
        <div className="space-y-3">
          {[
            { label: 'Annual GCI Goal', value: `$${gciGoal.toLocaleString()}`, sub: 'Your target' },
            { label: 'Avg GCI per Transaction', value: `$${avgGCI.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `${avgPrice.toLocaleString()} × ${avgCommPct}% × ${splitPct}%` },
            { label: 'Transactions Needed', value: txNeeded.toString(), sub: `${gciGoal.toLocaleString()} ÷ ${avgGCI.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            { label: 'Appointments Needed', value: apptsNeeded.toString(), sub: `${txNeeded} ÷ ${apptConvRate}% close rate` },
            { label: 'Total Leads Needed', value: leadsNeeded.toString(), sub: `${txNeeded} ÷ ${leadConvRate}% conversion` },
            { label: 'Monthly Leads', value: monthlyLeads.toString(), sub: `${leadsNeeded} ÷ 12 months` },
            { label: 'Weekly Contacts', value: weeklyContacts.toString(), sub: `${monthlyLeads} ÷ 4 weeks`, highlight: true },
            { label: 'Daily Contacts (5-day week)', value: dailyContacts.toString(), sub: 'Your daily number', highlight: true },
          ].map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${row.highlight ? 'bg-[#DC143C]/5 border-[#DC143C]/20' : 'bg-muted/30 border-border/50'}`}
            >
              <div>
                <div className={`text-sm font-medium ${row.highlight ? 'text-[#DC143C]' : 'text-foreground'}`}>{row.label}</div>
                <div className="text-[10px] text-muted-foreground">{row.sub}</div>
              </div>
              <div className={`font-mono text-lg font-bold ${row.highlight ? 'text-[#DC143C]' : 'text-foreground'}`}>{row.value}</div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 90-Day Cash Flow Forecast ───────────────────────────────────────
function ForecastTab({ financials, gciGoal }: { financials: any[]; gciGoal: number }) {
  const months = ['Month 1', 'Month 2', 'Month 3'];
  const monthlyTarget = Math.round(gciGoal / 12);

  // Simple forecast based on existing data patterns
  const [forecast, setForecast] = useState(() => {
    const totalIncome = financials.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
    const totalExpenses = financials.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
    const avgMonthlyIncome = totalIncome > 0 ? Math.round(totalIncome / 3) : monthlyTarget;
    const avgMonthlyExpense = totalExpenses > 0 ? Math.round(totalExpenses / 3) : Math.round(monthlyTarget * 0.3);

    return months.map((m, i) => ({
      month: m,
      projectedIncome: Math.round(avgMonthlyIncome * (1 + i * 0.05)),
      projectedExpenses: avgMonthlyExpense,
      pendingDeals: Math.round(2 + i * 0.5),
    }));
  });

  const updateForecast = (index: number, field: string, value: number) => {
    setForecast(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#DC143C]" /> 90-Day Cash Flow Forecast
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Project your income and expenses for the next 90 days. Edit values to model different scenarios.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Period</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Projected Income</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Projected Expenses</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Net Cash Flow</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Pending Deals</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((f, i) => {
                const net = f.projectedIncome - f.projectedExpenses;
                return (
                  <tr key={f.month} className="border-b border-border/50">
                    <td className="py-3 text-sm font-medium text-foreground">{f.month}</td>
                    <td className="py-3 text-center">
                      <Input
                        type="number"
                        value={f.projectedIncome}
                        onChange={e => updateForecast(i, 'projectedIncome', parseInt(e.target.value) || 0)}
                        className="w-28 h-8 text-center font-mono text-sm mx-auto"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <Input
                        type="number"
                        value={f.projectedExpenses}
                        onChange={e => updateForecast(i, 'projectedExpenses', parseInt(e.target.value) || 0)}
                        className="w-28 h-8 text-center font-mono text-sm mx-auto"
                      />
                    </td>
                    <td className={`py-3 text-center font-mono text-sm font-bold ${net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${net.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <Input
                        type="number"
                        value={f.pendingDeals}
                        onChange={e => updateForecast(i, 'pendingDeals', parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center font-mono text-sm mx-auto"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Projected Income</div>
            <div className="font-mono text-xl font-bold text-emerald-500">
              ${forecast.reduce((s, f) => s + f.projectedIncome, 0).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Projected Expenses</div>
            <div className="font-mono text-xl font-bold text-red-500">
              ${forecast.reduce((s, f) => s + f.projectedExpenses, 0).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[#DC143C]/5 border border-[#DC143C]/20 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net 90-Day Cash Flow</div>
            <div className="font-mono text-xl font-bold text-[#DC143C]">
              ${(forecast.reduce((s, f) => s + f.projectedIncome, 0) - forecast.reduce((s, f) => s + f.projectedExpenses, 0)).toLocaleString()}
            </div>
          </div>
        </div>

        {/* vs Goal */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">90-Day Income vs. Quarterly Goal</span>
            <span className="font-mono text-xs text-foreground">
              ${forecast.reduce((s, f) => s + f.projectedIncome, 0).toLocaleString()} / ${(monthlyTarget * 3).toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(100, Math.round((forecast.reduce((s, f) => s + f.projectedIncome, 0) / (monthlyTarget * 3)) * 100))} className="h-2.5" />
        </div>
      </Card>
    </div>
  );
}


// ─── Receipt Capture Tab ──────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  'Advertising', 'Car/Truck Expenses', 'Commission/Fees', 'Insurance',
  'Legal/Professional', 'Office Expense', 'Supplies', 'Travel', 'Meals',
  'Education', 'MLS Dues', 'Lockbox Fees', 'Photography', 'Staging',
  'Signs', 'Technology', 'Other'
];

function ReceiptCaptureTab() {
  const [receiptText, setReceiptText] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  const financialsQuery = trpc.financials.list.useQuery();
  const categorizeMutation = trpc.financials.categorizeReceipt.useMutation({
    onSuccess: (data) => {
      setManualForm({
        category: data.category || 'Other',
        description: `${data.vendor || ''} - ${data.description || ''}`,
        amount: data.amount || 0,
        date: data.date || new Date().toISOString().split('T')[0],
      });
      toast.success('Receipt categorized by AI');
    },
  });
  const createMutation = trpc.financials.create.useMutation({
    onSuccess: () => {
      financialsQuery.refetch();
      setAddOpen(false);
      setManualForm({ category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
      setReceiptText('');
      toast.success('Expense recorded');
    },
  });

  const expenses = ((financialsQuery.data || []) as any[]).filter(e => e.type === 'expense');
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Group by category
  const byCategory = useMemo(() => {
    const groups: Record<string, { count: number; total: number }> = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      if (!groups[cat]) groups[cat] = { count: 0, total: 0 };
      groups[cat].count++;
      groups[cat].total += e.amount || 0;
    });
    return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
  }, [expenses]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold">Receipt Capture</h3>
          <p className="text-xs text-muted-foreground">{expenses.length} expenses — ${totalExpenses.toLocaleString()} total</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs h-8">
              <Receipt className="w-3 h-3 mr-1" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display">Add Expense</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              {/* AI Categorization */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Label className="text-xs font-semibold mb-1 block">AI Receipt Scanner</Label>
                <Textarea
                  value={receiptText}
                  onChange={(e) => setReceiptText(e.target.value)}
                  placeholder="Paste or type receipt text here... e.g. 'Staples - $47.99 - office supplies - 03/15/2026'"
                  className="text-sm min-h-[60px] mb-2"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs w-full"
                  disabled={!receiptText || categorizeMutation.isPending}
                  onClick={() => categorizeMutation.mutate({ receiptText })}
                >
                  {categorizeMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Camera className="w-3 h-3 mr-1" />}
                  Auto-Categorize with AI
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={manualForm.category} onValueChange={(v) => setManualForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={manualForm.date} onChange={(e) => setManualForm(f => ({ ...f, date: e.target.value }))} className="h-8 text-xs" />
                </div>
              </div>
              <div><Label className="text-xs">Description</Label><Input value={manualForm.description} onChange={(e) => setManualForm(f => ({ ...f, description: e.target.value }))} className="h-8 text-sm" /></div>
              <div><Label className="text-xs">Amount ($)</Label><Input type="number" value={manualForm.amount} onChange={(e) => setManualForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="h-8 text-sm font-mono" /></div>
              <Button
                className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                disabled={!manualForm.amount}
                onClick={() => createMutation.mutate({
                  type: 'expense',
                  category: manualForm.category,
                  description: manualForm.description,
                  amount: manualForm.amount,
                  date: manualForm.date,
                  receiptText: receiptText || undefined,
                  autoCategory: categorizeMutation.data?.category || undefined,
                })}
              >
                Save Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {byCategory.map(([cat, data]) => (
            <Card key={cat} className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground truncate">{cat}</span>
              </div>
              <div className="font-mono text-sm font-bold">${data.total.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">{data.count} entries</div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent expenses */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No expenses recorded yet.</td></tr>
              ) : (
                expenses.slice(0, 20).map((e: any, i: number) => (
                  <tr key={e.id || i} className="border-b hover:bg-muted/20">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                    <td className="p-3 text-sm">{e.description || '—'}</td>
                    <td className="p-3 hidden sm:table-cell"><Badge variant="outline" className="text-[9px]">{e.category || 'Other'}</Badge></td>
                    <td className="p-3 text-right font-mono font-medium">${(e.amount || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tax Export Tab ──────────────────────────────────────────────────
function TaxExportTab() {
  // ── Accounting Integration Stubs ──
  const integrations = [
    { name: 'QuickBooks Online', status: 'coming_soon', logo: '📊', description: 'Sync commissions and expenses automatically' },
    { name: 'Wave Accounting', status: 'coming_soon', logo: '🌊', description: 'Free accounting for self-employed agents' },
    { name: 'FreshBooks', status: 'coming_soon', logo: '📗', description: 'Invoicing and expense tracking' },
  ];

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const taxQuery = trpc.financials.taxExport.useQuery({ year });
  const entries = (taxQuery.data || []) as any[];

  const income = entries.filter(e => e.type === 'income');
  const expenses = entries.filter(e => e.type === 'expense');
  const totalIncome = income.reduce((s, e) => s + (e.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // Group expenses by category for Schedule C
  const scheduleC = useMemo(() => {
    const groups: Record<string, number> = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      groups[cat] = (groups[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = entries.map(e => [
      e.date ? new Date(e.date).toLocaleDateString() : '',
      e.type,
      e.category || '',
      (e.description || '').replace(/,/g, ';'),
      e.amount || 0,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentos-tax-export-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${entries.length} entries for ${year}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold">Tax Export — Schedule C</h3>
          <p className="text-xs text-muted-foreground">{entries.length} entries for {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="h-8 text-xs w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={exportCSV} disabled={entries.length === 0}>
            <FileDown className="w-3 h-3 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Gross Income</div>
          <div className="font-mono text-xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">{income.length} entries</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Expenses</div>
          <div className="font-mono text-xl font-bold text-red-500">${totalExpenses.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">{expenses.length} entries</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Net Profit</div>
          <div className={`font-mono text-xl font-bold ${netProfit >= 0 ? 'text-[#DC143C]' : 'text-red-500'}`}>${netProfit.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Schedule C Line 31</div>
        </Card>
      </div>

      {/* Schedule C Category Breakdown */}
      <Card className="p-4">
        <h4 className="font-display text-xs font-bold mb-3 uppercase tracking-wider text-muted-foreground">Schedule C Expense Categories</h4>
        {scheduleC.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded for {year}.</p>
        ) : (
          <div className="space-y-2">
            {scheduleC.map(([cat, amount]) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-32 sm:w-40 text-xs truncate">{cat}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#DC143C] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="font-mono text-xs font-medium w-20 text-right">${amount.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Accounting Integrations */}
      <div className="space-y-3">
        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Accounting Integrations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {integrations.map(integration => (
            <div key={integration.name} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{integration.logo}</span>
                <span className="text-sm font-medium text-foreground">{integration.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
              <span className="text-[10px] uppercase tracking-wider font-medium text-amber-600 bg-amber-500/10 rounded px-2 py-0.5 w-fit">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground">
        <strong className="text-amber-600">Disclaimer:</strong> This export is for informational purposes only. Consult a licensed CPA or tax professional for official tax filing. AgentOS does not provide tax advice.
      </div>
    </div>
  );
}
