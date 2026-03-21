import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, TrendingUp, DollarSign } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

function fmt(n: number | string | null | undefined) {
  if (!n) return '—';
  return '$' + Number(n).toLocaleString();
}

function cashOnCash(prop: { monthlyRent?: string | null; monthlyExpenses?: string | null; purchasePrice?: string | null }) {
  const rent = Number(prop.monthlyRent ?? 0);
  const exp = Number(prop.monthlyExpenses ?? 0);
  const price = Number(prop.purchasePrice ?? 0);
  if (!price || !rent) return null;
  const annualNet = (rent - exp) * 12;
  return ((annualNet / price) * 100).toFixed(1);
}

export function InvestmentProperties() {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    address: '', purchaseDate: '', purchasePrice: '', currentValue: '',
    monthlyRent: '', monthlyExpenses: '', strategy: 'buy_hold' as const, notes: '',
  });

  const { data: properties, isLoading } = trpc.wealth.getProperties.useQuery();

  const addMutation = trpc.wealth.addProperty.useMutation({
    onSuccess: () => {
      utils.wealth.getProperties.invalidate();
      utils.wealth.getJourney.invalidate();
      setOpen(false);
      setForm({ address: '', purchaseDate: '', purchasePrice: '', currentValue: '', monthlyRent: '', monthlyExpenses: '', strategy: 'buy_hold', notes: '' });
      toast.success('Property added — saved to your portfolio.');
    },
    onError: () => toast.error('Failed to add property.'),
  });

  const deleteMutation = trpc.wealth.deleteProperty.useMutation({
    onSuccess: () => {
      utils.wealth.getProperties.invalidate();
      utils.wealth.getJourney.invalidate();
    },
  });

  const totalEquity = properties?.reduce((sum, p) => sum + (Number(p.currentValue ?? 0) - Number(p.purchasePrice ?? 0)), 0) ?? 0;
  const totalMonthlyNet = properties?.reduce((sum, p) => sum + (Number(p.monthlyRent ?? 0) - Number(p.monthlyExpenses ?? 0)), 0) ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Investment Properties
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Investment Property</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-8 text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Purchase Date</Label>
                    <Input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="h-8 text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <Select value={form.strategy} onValueChange={v => setForm(f => ({ ...f, strategy: v as typeof form.strategy }))}>
                      <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy_hold">Buy & Hold</SelectItem>
                        <SelectItem value="brrrr">BRRRR</SelectItem>
                        <SelectItem value="flip">Flip</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Purchase Price ($)</Label>
                    <Input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} className="h-8 text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Current Value ($)</Label>
                    <Input type="number" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} className="h-8 text-sm mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Monthly Rent ($)</Label>
                    <Input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} className="h-8 text-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Monthly Expenses ($)</Label>
                    <Input type="number" value={form.monthlyExpenses} onChange={e => setForm(f => ({ ...f, monthlyExpenses: e.target.value }))} className="h-8 text-sm mt-1" />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => addMutation.mutate({
                    address: form.address || undefined,
                    purchaseDate: form.purchaseDate || undefined,
                    purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
                    currentValue: form.currentValue ? Number(form.currentValue) : undefined,
                    monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : undefined,
                    monthlyExpenses: form.monthlyExpenses ? Number(form.monthlyExpenses) : undefined,
                    strategy: form.strategy,
                    notes: form.notes || undefined,
                  })}
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? 'Saving...' : 'Add Property'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary row */}
        {properties && properties.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <div className="text-xs text-muted-foreground">Properties</div>
              <div className="text-lg font-bold">{properties.length}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <div className="text-xs text-muted-foreground">Total Equity</div>
              <div className="text-sm font-bold text-emerald-400">{fmt(totalEquity)}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <div className="text-xs text-muted-foreground">Monthly Net</div>
              <div className="text-sm font-bold text-emerald-400">{fmt(totalMonthlyNet)}</div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />)}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="space-y-2">
            {properties.map(prop => {
              const coc = cashOnCash(prop);
              const net = Number(prop.monthlyRent ?? 0) - Number(prop.monthlyExpenses ?? 0);
              return (
                <div key={prop.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{prop.address ?? 'No address'}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{prop.strategy?.replace('_', ' ') ?? 'buy hold'}</Badge>
                        <Badge variant="outline" className="text-xs">{prop.status ?? 'active'}</Badge>
                        {prop.purchaseDate && <span className="text-xs text-muted-foreground">Purchased {String(prop.purchaseDate)}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: prop.id })}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Purchase: </span>
                      <span>{fmt(prop.purchasePrice)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value: </span>
                      <span>{fmt(prop.currentValue)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net/mo: </span>
                      <span className={net > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt(net)}</span>
                    </div>
                  </div>
                  {coc && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Cash-on-cash return: <span className="text-emerald-400 font-medium">{coc}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No investment properties yet.</p>
            <p className="text-xs mt-1">Add your first property to start tracking your portfolio.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
