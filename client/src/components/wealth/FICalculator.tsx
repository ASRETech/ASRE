import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator } from 'lucide-react';
import { trpc } from '@/lib/trpc';

function fmt(n: number) {
  return '$' + n.toLocaleString();
}

export function FICalculator() {
  const [gci, setGci] = useState(150000);
  const [expenses, setExpenses] = useState(60000);
  const [bizPct, setBizPct] = useState(29.2);
  const [splitsPct, setSplitsPct] = useState(10);
  const [taxRate, setTaxRate] = useState(28);
  const [tithePct, setTithePct] = useState(10);
  const [savingsRate, setSavingsRate] = useState(15);
  const [investReturn, setInvestReturn] = useState(8);
  const [currentSavings, setCurrentSavings] = useState(0);

  const { data } = trpc.wealth.getFiCalculation.useQuery(
    { gci, expenses, bizPct, splitsPct, taxRate, tithePct, savingsRate, investReturn, currentSavings },
    { placeholderData: (prev: any) => prev }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          FI Calculator
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Estimate your Financial Independence number and projected timeline.
          For actual planning, work with your CPA and fee-only advisor.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Annual GCI ($)</Label>
              <Input type="number" value={gci} onChange={e => setGci(Number(e.target.value))} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs">Annual Personal Expenses ($)</Label>
              <Input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs">Current Savings / Portfolio ($)</Label>
              <Input type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Brokerage Split %</Label>
                <span className="text-xs text-muted-foreground">{splitsPct}%</span>
              </div>
              <Slider min={0} max={50} step={0.5} value={[splitsPct]} onValueChange={([v]) => setSplitsPct(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Business Expenses % of GCI</Label>
                <span className="text-xs text-muted-foreground">{bizPct}%</span>
              </div>
              <Slider min={10} max={50} step={0.5} value={[bizPct]} onValueChange={([v]) => setBizPct(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Effective Tax Rate %</Label>
                <span className="text-xs text-muted-foreground">{taxRate}%</span>
              </div>
              <Slider min={15} max={45} step={1} value={[taxRate]} onValueChange={([v]) => setTaxRate(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Tithe %</Label>
                <span className="text-xs text-muted-foreground">{tithePct}%</span>
              </div>
              <Slider min={0} max={20} step={1} value={[tithePct]} onValueChange={([v]) => setTithePct(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Savings Rate %</Label>
                <span className="text-xs text-muted-foreground">{savingsRate}%</span>
              </div>
              <Slider min={5} max={50} step={1} value={[savingsRate]} onValueChange={([v]) => setSavingsRate(v)} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label className="text-xs">Expected Investment Return %</Label>
                <span className="text-xs text-muted-foreground">{investReturn}%</span>
              </div>
              <Slider min={4} max={12} step={0.5} value={[investReturn]} onValueChange={([v]) => setInvestReturn(v)} className="mt-2" />
            </div>
          </div>

          {/* Results */}
          {data && (
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Your FI Number</div>
                <div className="text-3xl font-bold text-primary">{fmt(data.fiNumber)}</div>
                <div className="text-xs text-muted-foreground mt-1">Annual expenses × 25 (4% rule)</div>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Projected FI Year</div>
                <div className="text-2xl font-bold">{data.fiYear}</div>
                <div className="text-xs text-muted-foreground">{data.yearsToFi} years from now</div>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Monthly Passive Income at FI</div>
                <div className="text-xl font-bold text-emerald-400">{fmt(data.monthlyPassiveIncome)}</div>
              </div>

              <div className="space-y-1.5 text-sm">
                {[
                  ['GCI after splits', fmt(data.grossAfterSplits)],
                  ['Business expenses', fmt(data.bizExpenses)],
                  ['Net before tax', fmt(data.netBeforeTax)],
                  ['Tithe', fmt(data.tithe)],
                  ['Tax owed', fmt(data.taxOwed)],
                  ['Net take-home', fmt(data.netTakeHome)],
                  ['Annual savings', fmt(data.annualSavings)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs border-b border-border/40 pb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-xs text-amber-300">
                  These projections are illustrative only. Work with your CPA and a fee-only financial advisor to build an actual FI plan.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
