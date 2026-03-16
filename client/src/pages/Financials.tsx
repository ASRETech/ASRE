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
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    tithe: 10,
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
  const tithe = afterFees * (allocations.tithe / 100);
  const netDeposit = afterFees - taxReserve - tithe;

  // Profit First breakdown
  const pfBreakdown = [
    { label: 'Taxes', pct: allocations.taxes, amount: afterFees * (allocations.taxes / 100), color: 'bg-red-500' },
    { label: 'Tithe', pct: allocations.tithe, amount: afterFees * (allocations.tithe / 100), color: 'bg-violet-500' },
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
          <TabsList className="bg-muted/50 w-full sm:w-auto flex">
            <TabsTrigger value="calculator" className="text-xs flex-1 sm:flex-initial">Calculator</TabsTrigger>
            <TabsTrigger value="profitfirst" className="text-xs flex-1 sm:flex-initial">Profit First</TabsTrigger>
            <TabsTrigger value="pnl" className="text-xs flex-1 sm:flex-initial">P&L</TabsTrigger>
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
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tithe ({allocations.tithe}%)</div>
                  <div className="font-mono text-lg font-bold text-violet-500">-${tithe.toLocaleString()}</div>
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
        </Tabs>
      </div>
    </div>
  );
}
