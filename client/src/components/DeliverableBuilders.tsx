// Deliverable Builder Modals — Interactive guided builders for Level 1 & 2 deliverables
// Each builder is a focused wizard that helps the agent create the deliverable
// When completed, it marks the deliverable as done and saves the output
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import {
  ArrowRight, ArrowLeft, Check, Calculator, Database, Megaphone,
  Calendar, Compass, Target, Sparkles, Download, Save
} from 'lucide-react';

// ============================================================
// 1. PERSONAL ECONOMIC MODEL BUILDER (l1-d1)
// ============================================================
export function PEMBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [salePrice, setSalePrice] = useState([350000]);
  const [commissionRate, setCommissionRate] = useState([3]);
  const [brokerageSplit, setBrokerageSplit] = useState([70]);
  const [transactionsGoal, setTransactionsGoal] = useState([24]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([3500]);

  // Profit First allocations
  const [taxRate, setTaxRate] = useState(21);
  const [titheRate, setTitheRate] = useState(10);
  const [operatingRate, setOperatingRate] = useState(15);
  const [ownerPayRate, setOwnerPayRate] = useState(30);
  const [profitRate, setProfitRate] = useState(14);
  const [investRate, setInvestRate] = useState(10);

  // Calculations
  const grossPerDeal = salePrice[0] * (commissionRate[0] / 100);
  const afterSplit = grossPerDeal * (brokerageSplit[0] / 100);
  const annualGCI = afterSplit * transactionsGoal[0];
  const monthlyGCI = annualGCI / 12;
  const annualExpenses = monthlyExpenses[0] * 12;
  const netIncome = annualGCI - annualExpenses;
  const effectiveHourly = netIncome / 2000; // ~50 weeks * 40 hrs
  const breakEvenDeals = Math.ceil(annualExpenses / afterSplit);

  const handleComplete = () => {
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: 'l1-d1' });
    toast.success('Personal Economic Model completed!', {
      description: `Target: ${transactionsGoal[0]} deals → $${annualGCI.toLocaleString()} GCI`
    });
    onClose();
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#DC143C]" />
            Personal Economic Model
          </DialogTitle>
          <DialogDescription>Build your income roadmap — know exactly how many deals you need.</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#DC143C]' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-foreground">Deal Economics</h3>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Avg Sale Price</Label>
                <span className="font-mono text-lg font-bold text-foreground">${salePrice[0].toLocaleString()}</span>
              </div>
              <Slider value={salePrice} onValueChange={setSalePrice} min={100000} max={1000000} step={25000} />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1"><span>$100K</span><span>$1M</span></div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Commission Rate</Label>
                <span className="font-mono text-lg font-bold text-foreground">{commissionRate[0]}%</span>
              </div>
              <Slider value={commissionRate} onValueChange={setCommissionRate} min={1} max={6} step={0.25} />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your Split (after brokerage)</Label>
                <span className="font-mono text-lg font-bold text-foreground">{brokerageSplit[0]}%</span>
              </div>
              <Slider value={brokerageSplit} onValueChange={setBrokerageSplit} min={50} max={100} step={5} />
            </div>

            {/* Live calculation */}
            <Card className="p-4 bg-muted/30">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Per Deal Breakdown</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-mono text-sm text-muted-foreground">Gross</div>
                  <div className="font-mono text-lg font-bold text-foreground">${grossPerDeal.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-mono text-sm text-muted-foreground">After Split</div>
                  <div className="font-mono text-lg font-bold text-[#DC143C]">${afterSplit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-mono text-sm text-muted-foreground">Tax Reserve</div>
                  <div className="font-mono text-lg font-bold text-foreground">${Math.round(afterSplit * 0.21).toLocaleString()}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-foreground">Annual Targets</h3>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Transaction Goal</Label>
                <span className="font-mono text-lg font-bold text-foreground">{transactionsGoal[0]} deals/year</span>
              </div>
              <Slider value={transactionsGoal} onValueChange={setTransactionsGoal} min={6} max={100} step={1} />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1"><span>6</span><span>100</span></div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Monthly Business Expenses</Label>
                <span className="font-mono text-lg font-bold text-foreground">${monthlyExpenses[0].toLocaleString()}</span>
              </div>
              <Slider value={monthlyExpenses} onValueChange={setMonthlyExpenses} min={500} max={15000} step={250} />
            </div>

            {/* Annual projection */}
            <Card className="p-4 bg-muted/30">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Annual Projection</div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Annual GCI</span><span className="font-mono font-bold text-foreground">${annualGCI.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Monthly GCI</span><span className="font-mono text-foreground">${Math.round(monthlyGCI).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Annual Expenses</span><span className="font-mono text-foreground">-${annualExpenses.toLocaleString()}</span></div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-sm font-medium text-foreground">Net Income</span>
                  <span className={`font-mono font-bold ${netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${netIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Effective Hourly Rate</span><span className="font-mono text-foreground">${Math.round(effectiveHourly)}/hr</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Break-Even Deals</span><span className="font-mono text-[#DC143C] font-bold">{breakEvenDeals} deals</span></div>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-foreground">Profit First Allocation</h3>
            <p className="text-sm text-muted-foreground">How every commission check gets allocated. Adjust percentages to match your plan.</p>
            
            {/* Allocation buckets */}
            <div className="space-y-3">
              {[
                { label: 'Taxes', value: taxRate, set: setTaxRate, color: 'bg-red-500' },
                { label: 'Tithe', value: titheRate, set: setTitheRate, color: 'bg-violet-500' },
                { label: 'Operating', value: operatingRate, set: setOperatingRate, color: 'bg-blue-500' },
                { label: 'Owner Pay', value: ownerPayRate, set: setOwnerPayRate, color: 'bg-emerald-500' },
                { label: 'Profit/Savings', value: profitRate, set: setProfitRate, color: 'bg-amber-500' },
                { label: 'Bitcoin/Investment', value: investRate, set: setInvestRate, color: 'bg-orange-500' },
              ].map((bucket) => (
                <div key={bucket.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-sm ${bucket.color} shrink-0`} />
                  <span className="text-sm text-foreground w-32">{bucket.label}</span>
                  <Input
                    type="number"
                    value={bucket.value}
                    onChange={(e) => bucket.set(Number(e.target.value))}
                    className="w-20 h-8 text-center font-mono text-sm"
                    min={0}
                    max={100}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  <span className="font-mono text-sm text-foreground ml-auto">
                    ${Math.round(afterSplit * (bucket.value / 100)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total check */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm font-medium text-foreground">Total Allocation</span>
              <span className={`font-mono font-bold ${
                taxRate + titheRate + operatingRate + ownerPayRate + profitRate + investRate === 100
                  ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {taxRate + titheRate + operatingRate + ownerPayRate + profitRate + investRate}%
              </span>
            </div>

            {/* Visual bar */}
            <div className="h-6 rounded-lg overflow-hidden flex">
              {[
                { pct: taxRate, color: 'bg-red-500' },
                { pct: titheRate, color: 'bg-violet-500' },
                { pct: operatingRate, color: 'bg-blue-500' },
                { pct: ownerPayRate, color: 'bg-emerald-500' },
                { pct: profitRate, color: 'bg-amber-500' },
                { pct: investRate, color: 'bg-orange-500' },
              ].map((b, i) => (
                <div key={i} className={`${b.color} transition-all`} style={{ width: `${b.pct}%` }} />
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="sm:mr-auto">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              <Save className="w-4 h-4 mr-1" /> Save Economic Model
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 2. DATABASE SETUP BUILDER (l1-d2)
// ============================================================
export function DatabaseSetupBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, state } = useApp();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<string[]>(['Sphere', 'Past Client', 'Referral Partner']);
  const [newCategory, setNewCategory] = useState('');
  const [contactGoal, setContactGoal] = useState([500]);
  const [touchFrequency, setTouchFrequency] = useState('monthly');

  const currentContacts = state.leads.length;

  const handleComplete = () => {
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: 'l1-d2' });
    toast.success('Database Setup completed!', {
      description: `${currentContacts} contacts organized with ${categories.length} categories`
    });
    onClose();
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-[#DC143C]" />
            Database Setup
          </DialogTitle>
          <DialogDescription>Organize your contacts into a system that generates referrals.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#DC143C]' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-foreground">Contact Categories</h3>
            <p className="text-sm text-muted-foreground">Define how you'll segment your database. The MREA model recommends at minimum: Sphere, Past Clients, and Referral Partners.</p>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-sm px-3 py-1.5 flex items-center gap-1.5">
                  {cat}
                  <button onClick={() => setCategories(prev => prev.filter(c => c !== cat))} className="text-muted-foreground hover:text-foreground">
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add category (e.g., Vendor, Investor)"
                className="flex-1 h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategory.trim()) {
                    setCategories(prev => [...prev, newCategory.trim()]);
                    setNewCategory('');
                  }
                }}
              />
              <Button variant="outline" size="sm" className="h-9" onClick={() => {
                if (newCategory.trim()) {
                  setCategories(prev => [...prev, newCategory.trim()]);
                  setNewCategory('');
                }
              }}>Add</Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['A-List (Met, Know, Like)', 'B-List (Haven\'t Met)', 'FSBO/Expired', 'Builder/Developer', 'Lender Partner', 'Title Partner'].map(sug => (
                <button
                  key={sug}
                  onClick={() => !categories.includes(sug) && setCategories(prev => [...prev, sug])}
                  disabled={categories.includes(sug)}
                  className="text-left text-xs p-2.5 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-30 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-foreground">Database Goals</h3>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Contact Goal</Label>
                <span className="font-mono text-lg font-bold text-foreground">{contactGoal[0]} contacts</span>
              </div>
              <Slider value={contactGoal} onValueChange={setContactGoal} min={100} max={2000} step={50} />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1"><span>100</span><span>2,000</span></div>
            </div>

            <Card className="p-4 bg-muted/30">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Progress</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-2xl font-bold text-foreground">{currentContacts}</span>
                <span className="text-sm text-muted-foreground">/ {contactGoal[0]} contacts</span>
              </div>
              <Progress value={Math.min(100, (currentContacts / contactGoal[0]) * 100)} className="h-2" />
            </Card>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Touch Frequency</Label>
              <Select value={touchFrequency} onValueChange={setTouchFrequency}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly (A-List)</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly (B-List)</SelectItem>
                  <SelectItem value="quarterly">Quarterly (C-List)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-foreground">Your Database Plan</h3>
            <Card className="p-5">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Categories</span><span className="font-mono text-sm font-medium text-foreground">{categories.length}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Current Contacts</span><span className="font-mono text-sm font-medium text-foreground">{currentContacts}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Target</span><span className="font-mono text-sm font-medium text-[#DC143C]">{contactGoal[0]}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Touch Frequency</span><span className="text-sm font-medium text-foreground capitalize">{touchFrequency}</span></div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-sm text-muted-foreground">Contacts to Add</span>
                  <span className="font-mono text-sm font-bold text-foreground">{Math.max(0, contactGoal[0] - currentContacts)}</span>
                </div>
              </div>
            </Card>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <Badge key={cat} className="bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20">{cat}</Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="sm:mr-auto">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              <Save className="w-4 h-4 mr-1" /> Complete Database Setup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 3. LEAD GENERATION SOURCES BUILDER (l1-d3)
// ============================================================
export function LeadGenBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Record<string, number>>({});

  const sources = [
    { name: 'Sphere of Influence', desc: 'People who know, like, and trust you', icon: '🤝', cost: 'Free' },
    { name: 'Open Houses', desc: 'Face-to-face lead generation', icon: '🏠', cost: 'Low' },
    { name: 'Online Leads (Zillow, Realtor.com)', desc: 'Paid lead portals', icon: '🌐', cost: 'High' },
    { name: 'Social Media', desc: 'Organic content marketing', icon: '📱', cost: 'Free' },
    { name: 'Door Knocking', desc: 'Direct outreach in target areas', icon: '🚪', cost: 'Free' },
    { name: 'Expired/FSBO', desc: 'Prospecting off-market opportunities', icon: '📋', cost: 'Low' },
    { name: 'Referral Network', desc: 'Lenders, title, attorneys', icon: '🔗', cost: 'Free' },
    { name: 'Paid Advertising', desc: 'Google/Meta ads', icon: '💰', cost: 'High' },
    { name: 'Community Events', desc: 'Networking and sponsorships', icon: '🎪', cost: 'Medium' },
    { name: 'Past Client Nurture', desc: 'Repeat and referral business', icon: '💎', cost: 'Low' },
  ];

  const handleComplete = () => {
    if (selectedSources.length < 2) {
      toast.error('Select at least 2 lead sources');
      return;
    }
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: 'l1-d3' });
    toast.success('Lead Generation Sources set!', {
      description: `${selectedSources.length} active sources identified`
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#DC143C]" />
            Lead Generation Sources
          </DialogTitle>
          <DialogDescription>Select at least 2 active lead sources. The MREA model says you need multiple pillars.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sources.map((source) => {
            const isSelected = selectedSources.includes(source.name);
            return (
              <button
                key={source.name}
                onClick={() => {
                  if (isSelected) {
                    setSelectedSources(prev => prev.filter(s => s !== source.name));
                  } else {
                    setSelectedSources(prev => [...prev, source.name]);
                  }
                }}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#DC143C] bg-[#DC143C]/5'
                    : 'border-border hover:border-border/80 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">{source.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{source.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#DC143C]" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{source.desc}</p>
                    <Badge variant="outline" className="text-[9px] mt-1 font-mono">{source.cost}</Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedSources.length > 0 && (
          <Card className="p-4 bg-muted/30 mt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Weekly Activity Goals</div>
            <div className="space-y-2">
              {selectedSources.map(source => (
                <div key={source} className="flex items-center gap-3">
                  <span className="text-sm text-foreground flex-1 truncate">{source}</span>
                  <Input
                    type="number"
                    value={weeklyGoals[source] || ''}
                    onChange={(e) => setWeeklyGoals(prev => ({ ...prev, [source]: Number(e.target.value) }))}
                    placeholder="hrs/wk"
                    className="w-24 h-8 text-center font-mono text-sm"
                  />
                  <span className="text-xs text-muted-foreground">hrs/wk</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <DialogFooter>
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-xs text-muted-foreground">{selectedSources.length} selected</span>
            {selectedSources.length < 2 && <span className="text-xs text-amber-500">(min 2)</span>}
          </div>
          <Button onClick={handleComplete} disabled={selectedSources.length < 2} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
            <Save className="w-4 h-4 mr-1" /> Save Lead Sources
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 4. CALENDAR ARCHITECTURE BUILDER (l1-d4)
// ============================================================
const TIME_BLOCKS = [
  { time: '6:00 AM', label: 'Morning Routine' },
  { time: '7:00 AM', label: 'Lead Generation' },
  { time: '8:00 AM', label: 'Lead Generation' },
  { time: '9:00 AM', label: 'Lead Follow-Up' },
  { time: '10:00 AM', label: 'Appointments' },
  { time: '11:00 AM', label: 'Appointments' },
  { time: '12:00 PM', label: 'Lunch / Break' },
  { time: '1:00 PM', label: 'Appointments' },
  { time: '2:00 PM', label: 'Appointments' },
  { time: '3:00 PM', label: 'Admin / Paperwork' },
  { time: '4:00 PM', label: 'Follow-Up / CRM' },
  { time: '5:00 PM', label: 'End of Day Review' },
];

const BLOCK_TYPES = [
  { value: 'lead-gen', label: 'Lead Generation', color: 'bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20' },
  { value: 'follow-up', label: 'Follow-Up', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'appointments', label: 'Appointments', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { value: 'admin', label: 'Admin / Paperwork', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { value: 'personal', label: 'Personal / Break', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  { value: 'training', label: 'Training / Learning', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
];

export function CalendarBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [blocks, setBlocks] = useState<Record<string, string>>(
    Object.fromEntries(TIME_BLOCKS.map(b => [b.time, b.label.toLowerCase().includes('lead gen') ? 'lead-gen' : b.label.toLowerCase().includes('follow') ? 'follow-up' : b.label.toLowerCase().includes('appoint') ? 'appointments' : b.label.toLowerCase().includes('admin') || b.label.toLowerCase().includes('paper') ? 'admin' : 'personal']))
  );

  const handleComplete = () => {
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: 'l1-d4' });
    toast.success('Calendar Architecture saved!', { description: 'Your weekly time-block template is set.' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#DC143C]" />
            Calendar Architecture
          </DialogTitle>
          <DialogDescription>Build your ideal weekly time-block template. Assign each hour to a category.</DialogDescription>
        </DialogHeader>

        {/* Legend */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {BLOCK_TYPES.map(bt => (
            <Badge key={bt.value} variant="outline" className={`text-[10px] ${bt.color}`}>{bt.label}</Badge>
          ))}
        </div>

        {/* Time blocks */}
        <div className="space-y-1.5">
          {TIME_BLOCKS.map((block) => (
            <div key={block.time} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">{block.time}</span>
              <Select value={blocks[block.time] || 'personal'} onValueChange={(v) => setBlocks(prev => ({ ...prev, [block.time]: v }))}>
                <SelectTrigger className={`h-8 text-xs flex-1 ${BLOCK_TYPES.find(bt => bt.value === blocks[block.time])?.color || ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map(bt => (
                    <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Summary */}
        <Card className="p-3 bg-muted/30 mt-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Time Allocation</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BLOCK_TYPES.map(bt => {
              const hours = Object.values(blocks).filter(v => v === bt.value).length;
              return (
                <div key={bt.value} className="text-center">
                  <div className="font-mono text-sm font-bold text-foreground">{hours}h</div>
                  <div className="text-[10px] text-muted-foreground">{bt.label}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <DialogFooter>
          <Button onClick={handleComplete} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
            <Save className="w-4 h-4 mr-1" /> Save Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 5. PERSONAL MISSION STATEMENT BUILDER (l1-d5)
// ============================================================
const MISSION_PROMPTS = [
  { id: 'problem', question: 'What problem does your team uniquely solve for clients?', placeholder: 'e.g., We eliminate the stress and confusion of buying/selling a home by...' },
  { id: 'client', question: 'What would your best client say about working with you?', placeholder: 'e.g., They made the process seamless and always had my best interest...' },
  { id: 'community', question: 'What would your community lose if your team didn\'t exist?', placeholder: 'e.g., Families would lose a trusted advisor who genuinely cares about...' },
  { id: 'purpose', question: 'Complete this: "We exist to ___________."', placeholder: 'e.g., ...help families build generational wealth through strategic real estate decisions.' },
];

export function MissionBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missionDraft, setMissionDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentPrompt = MISSION_PROMPTS[step];
  const allAnswered = MISSION_PROMPTS.every(p => (answers[p.id] || '').trim().length > 0);

  const generateMission = () => {
    setIsGenerating(true);
    // Synthesize from answers (client-side for MVP — will use AI in full version)
    const draft = `We exist to ${answers.purpose || 'serve our community'}. ${answers.problem || ''} Our clients say ${answers.client || 'we deliver exceptional results'}. Without us, ${answers.community || 'our community would lose a trusted partner'}.`;
    setTimeout(() => {
      setMissionDraft(draft);
      setIsGenerating(false);
    }, 1000);
  };

  const handleComplete = () => {
    dispatch({ type: 'UPDATE_CULTURE', payload: { missionStatement: missionDraft || Object.values(answers).join(' ') } });
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: 'l1-d5' });
    toast.success('Mission Statement created!');
    onClose();
    setStep(0);
    setAnswers({});
    setMissionDraft('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#DC143C]" />
            Personal Mission Statement
          </DialogTitle>
          <DialogDescription>Not a blank text box — a guided conversation to discover your purpose.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 mb-4">
          {[...MISSION_PROMPTS, { id: 'review' }].map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#DC143C]' : 'bg-muted'}`} />
          ))}
        </div>

        {step < MISSION_PROMPTS.length && currentPrompt && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="text-xs text-[#DC143C] font-mono uppercase tracking-wider mb-2">Question {step + 1} of {MISSION_PROMPTS.length}</div>
              <p className="text-sm font-medium text-foreground">{currentPrompt.question}</p>
            </div>
            <Textarea
              value={answers[currentPrompt.id] || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentPrompt.id]: e.target.value }))}
              placeholder={currentPrompt.placeholder}
              className="min-h-[120px] text-sm"
            />
          </div>
        )}

        {step === MISSION_PROMPTS.length && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Your Mission Statement</h3>
            {!missionDraft && !isGenerating && (
              <Button onClick={generateMission} variant="outline" className="w-full">
                <Sparkles className="w-4 h-4 mr-2 text-[#DC143C]" />
                Generate Draft from Your Answers
              </Button>
            )}
            {isGenerating && (
              <div className="text-center py-8 text-muted-foreground text-sm">Crafting your mission statement...</div>
            )}
            {missionDraft && (
              <Textarea
                value={missionDraft}
                onChange={(e) => setMissionDraft(e.target.value)}
                className="min-h-[150px] text-sm"
                placeholder="Your mission statement..."
              />
            )}
            <div className="text-xs text-muted-foreground">
              Edit freely — this is your statement. You own it.
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="sm:mr-auto">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < MISSION_PROMPTS.length ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!(answers[currentPrompt?.id] || '').trim()}
              className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!missionDraft.trim()} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              <Save className="w-4 h-4 mr-1" /> Save Mission Statement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 6. 4-1-1 GOAL SETTING BUILDER (l1-d6)
// ============================================================
export function GoalSettingBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [annualGoals, setAnnualGoals] = useState(['', '', '', '']);
  const [monthlyGoals, setMonthlyGoals] = useState(['', '', '']);
  const [weeklyActions, setWeeklyActions] = useState(['', '', '', '', '']);

  const handleComplete = () => {
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: 'l1-d6' });
    toast.success('4-1-1 Goals set!', { description: 'Annual → Monthly → Weekly cascade established.' });
    onClose();
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Target className="w-5 h-5 text-[#DC143C]" />
            4-1-1 Goal Setting
          </DialogTitle>
          <DialogDescription>The KW goal cascade: 4 annual goals → 1 monthly priority → 1 weekly action set.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#DC143C]' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Annual Goals (The "4")</h3>
            <p className="text-sm text-muted-foreground">Set 4 big goals for the year. Think GCI, transactions, team growth, and personal.</p>
            {annualGoals.map((goal, i) => (
              <div key={i}>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Goal {i + 1}</Label>
                <Input
                  value={goal}
                  onChange={(e) => {
                    const updated = [...annualGoals];
                    updated[i] = e.target.value;
                    setAnnualGoals(updated);
                  }}
                  placeholder={['e.g., Close 24 transactions', 'e.g., $200K GCI', 'e.g., Hire first EA', 'e.g., Pay off $20K debt'][i]}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Monthly Priorities (The "1")</h3>
            <p className="text-sm text-muted-foreground">What are the 3 priorities for THIS month that move you toward your annual goals?</p>
            {monthlyGoals.map((goal, i) => (
              <div key={i}>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Priority {i + 1}</Label>
                <Input
                  value={goal}
                  onChange={(e) => {
                    const updated = [...monthlyGoals];
                    updated[i] = e.target.value;
                    setMonthlyGoals(updated);
                  }}
                  placeholder={['e.g., 20 new contacts added to DB', 'e.g., 4 listing appointments', 'e.g., Complete EA job description'][i]}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Weekly Actions (The "1")</h3>
            <p className="text-sm text-muted-foreground">5 specific actions you commit to EVERY week. These are your non-negotiables.</p>
            {weeklyActions.map((action, i) => (
              <div key={i}>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Action {i + 1}</Label>
                <Input
                  value={action}
                  onChange={(e) => {
                    const updated = [...weeklyActions];
                    updated[i] = e.target.value;
                    setWeeklyActions(updated);
                  }}
                  placeholder={['e.g., 25 contacts made', 'e.g., 5 handwritten notes', 'e.g., 2 open houses', 'e.g., 1 listing presentation', 'e.g., Review pipeline every Friday'][i]}
                  className="h-9"
                />
              </div>
            ))}

            {/* Summary */}
            <Card className="p-4 bg-muted/30 mt-2">
              <div className="text-xs text-[#DC143C] font-mono uppercase tracking-wider mb-2">Your 4-1-1 Cascade</div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-foreground">Annual:</span>
                  <span className="text-xs text-muted-foreground ml-1">{annualGoals.filter(g => g.trim()).length} goals set</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-foreground">Monthly:</span>
                  <span className="text-xs text-muted-foreground ml-1">{monthlyGoals.filter(g => g.trim()).length} priorities set</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-foreground">Weekly:</span>
                  <span className="text-xs text-muted-foreground ml-1">{weeklyActions.filter(a => a.trim()).length} actions committed</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="sm:mr-auto">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
              <Save className="w-4 h-4 mr-1" /> Save 4-1-1 Goals
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// BUILDER REGISTRY — maps deliverable IDs to builder components
// ============================================================
export const BUILDER_REGISTRY: Record<string, React.ComponentType<{ open: boolean; onClose: () => void }>> = {
  'l1-d1': PEMBuilder,
  'l1-d2': DatabaseSetupBuilder,
  'l1-d3': LeadGenBuilder,
  'l1-d4': CalendarBuilder,
  'l1-d5': MissionBuilder,
  'l1-d6': GoalSettingBuilder,
};
