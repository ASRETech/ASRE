import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeadGenCalculator() {
  const [gciGoal, setGciGoal] = useState(150000);
  const [avgCommission, setAvgCommission] = useState(8000);
  const [conversionRate, setConversionRate] = useState(3);
  const [workDays, setWorkDays] = useState(220);

  const results = useMemo(() => {
    const closingsNeeded = gciGoal / Math.max(1, avgCommission);
    const contactsNeeded = closingsNeeded / Math.max(0.001, conversionRate / 100);
    const dailyContacts = contactsNeeded / Math.max(1, workDays);
    const weeklyContacts = dailyContacts * 5;
    return {
      closingsNeeded: Math.ceil(closingsNeeded),
      contactsNeeded: Math.ceil(contactsNeeded),
      dailyContacts: Math.ceil(dailyContacts),
      weeklyContacts: Math.ceil(weeklyContacts),
    };
  }, [gciGoal, avgCommission, conversionRate, workDays]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#DC143C]" /> Lead Gen Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">GCI Goal ($)</Label>
            <Input type="number" value={gciGoal} onChange={e => setGciGoal(Number(e.target.value))} className="mt-1 text-sm h-8" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Avg Commission ($)</Label>
            <Input type="number" value={avgCommission} onChange={e => setAvgCommission(Number(e.target.value))} className="mt-1 text-sm h-8" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Conversion Rate (%)</Label>
            <Input type="number" value={conversionRate} onChange={e => setConversionRate(Number(e.target.value))} className="mt-1 text-sm h-8" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Work Days / Year</Label>
            <Input type="number" value={workDays} onChange={e => setWorkDays(Number(e.target.value))} className="mt-1 text-sm h-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-500">{results.dailyContacts}</div>
            <div className="text-xs text-muted-foreground">Daily Contacts</div>
          </div>
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-violet-500">{results.weeklyContacts}</div>
            <div className="text-xs text-muted-foreground">Weekly Contacts</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-emerald-500">{results.closingsNeeded}</div>
            <div className="text-xs text-muted-foreground">Closings Needed</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-amber-500">{results.contactsNeeded}</div>
            <div className="text-xs text-muted-foreground">Total Contacts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
