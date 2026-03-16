// Referral Partner Network — Two-panel: Partners list + Referral log
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, Handshake, ArrowRightLeft, DollarSign, Search, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { nanoid } from 'nanoid';

type Partner = {
  partnerId: string;
  name: string;
  company?: string | null;
  specialty?: string | null;
  phone?: string | null;
  email?: string | null;
  market?: string | null;
  notes?: string | null;
};

type Referral = {
  id: number;
  partnerId: string;
  direction: string;
  contactName?: string | null;
  estimatedGCI?: number | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
};

export default function ReferralsPage() {
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [addReferralOpen, setAddReferralOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerForm, setPartnerForm] = useState({ name: '', company: '', specialty: '', phone: '', email: '', market: '', notes: '' });
  const [referralForm, setReferralForm] = useState({ partnerId: '', direction: 'sent', clientName: '', status: 'pending', amount: 0, notes: '' });

  const partnersQuery = trpc.referrals.partners.list.useQuery();
  const referralsQuery = trpc.referrals.exchanges.list.useQuery({});

  const createPartner = trpc.referrals.partners.create.useMutation({
    onSuccess: () => { partnersQuery.refetch(); setAddPartnerOpen(false); setPartnerForm({ name: '', company: '', specialty: '', phone: '', email: '', market: '', notes: '' }); toast.success('Partner added'); },
  });
  const updatePartner = trpc.referrals.partners.update.useMutation({
    onSuccess: () => { partnersQuery.refetch(); toast.success('Partner updated'); },
  });
  const createReferral = trpc.referrals.exchanges.create.useMutation({
    onSuccess: () => { referralsQuery.refetch(); setAddReferralOpen(false); setReferralForm({ partnerId: '', direction: 'sent', clientName: '', status: 'pending', amount: 0, notes: '' }); toast.success('Referral logged'); },
  });

  const partners: Partner[] = (partnersQuery.data || []) as Partner[];
  const referrals: Referral[] = (referralsQuery.data || []) as Referral[];

  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    const q = searchQuery.toLowerCase();
    return partners.filter(p => p.name.toLowerCase().includes(q) || (p.company || '').toLowerCase().includes(q) || (p.specialty || '').toLowerCase().includes(q));
  }, [partners, searchQuery]);

  const sentCount = referrals.filter(r => r.direction === 'sent').length;
  const receivedCount = referrals.filter(r => r.direction === 'received').length;
  const totalReferralValue = referrals.reduce((s, r) => s + (r.estimatedGCI || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold">Referral Network</h1>
            <p className="text-xs text-muted-foreground mt-1">{partners.length} partners — {referrals.length} referrals logged</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addPartnerOpen} onOpenChange={setAddPartnerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <UserPlus className="w-3 h-3 mr-1" /> Add Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="font-display">Add Referral Partner</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Name *</Label><Input value={partnerForm.name} onChange={(e) => setPartnerForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Company</Label><Input value={partnerForm.company} onChange={(e) => setPartnerForm(f => ({ ...f, company: e.target.value }))} className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Specialty</Label><Input value={partnerForm.specialty} onChange={(e) => setPartnerForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Relocation" className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Market</Label><Input value={partnerForm.market} onChange={(e) => setPartnerForm(f => ({ ...f, market: e.target.value }))} placeholder="e.g. Cincinnati" className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Phone</Label><Input value={partnerForm.phone} onChange={(e) => setPartnerForm(f => ({ ...f, phone: e.target.value }))} className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Email</Label><Input value={partnerForm.email} onChange={(e) => setPartnerForm(f => ({ ...f, email: e.target.value }))} className="h-8 text-sm" /></div>
                  </div>
                  <div><Label className="text-xs">Notes</Label><Textarea value={partnerForm.notes} onChange={(e) => setPartnerForm(f => ({ ...f, notes: e.target.value }))} className="text-sm min-h-[60px]" /></div>
                  <Button className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs" disabled={!partnerForm.name} onClick={() => createPartner.mutate({ partnerId: nanoid(), ...partnerForm })}>
                    Add Partner
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={addReferralOpen} onOpenChange={setAddReferralOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs h-8">
                  <ArrowRightLeft className="w-3 h-3 mr-1" /> Log Referral
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="font-display">Log Referral</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs">Partner *</Label>
                    <Select value={referralForm.partnerId} onValueChange={(v) => setReferralForm(f => ({ ...f, partnerId: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select partner..." /></SelectTrigger>
                      <SelectContent>
                        {partners.map(p => <SelectItem key={p.partnerId} value={p.partnerId}>{p.name} {p.company ? `(${p.company})` : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Direction</Label>
                      <Select value={referralForm.direction} onValueChange={(v) => setReferralForm(f => ({ ...f, direction: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select value={referralForm.status} onValueChange={(v) => setReferralForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label className="text-xs">Client Name *</Label><Input value={referralForm.clientName} onChange={(e) => setReferralForm(f => ({ ...f, clientName: e.target.value }))} className="h-8 text-sm" /></div>
                  <div><Label className="text-xs">Referral Fee ($)</Label><Input type="number" value={referralForm.amount} onChange={(e) => setReferralForm(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))} className="h-8 text-sm font-mono" /></div>
                  <div><Label className="text-xs">Notes</Label><Textarea value={referralForm.notes} onChange={(e) => setReferralForm(f => ({ ...f, notes: e.target.value }))} className="text-sm min-h-[60px]" /></div>
                  <Button className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs" disabled={!referralForm.partnerId || !referralForm.clientName} onClick={() => createReferral.mutate({ partnerId: referralForm.partnerId, direction: referralForm.direction as any, contactName: referralForm.clientName, estimatedGCI: referralForm.amount, status: referralForm.status as any, notes: referralForm.notes })}>
                    Log Referral
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 text-center"><div className="text-lg font-mono font-bold">{partners.length}</div><div className="text-[10px] text-muted-foreground uppercase">Partners</div></Card>
          <Card className="p-3 text-center"><div className="text-lg font-mono font-bold">{sentCount}</div><div className="text-[10px] text-muted-foreground uppercase">Sent</div></Card>
          <Card className="p-3 text-center"><div className="text-lg font-mono font-bold">{receivedCount}</div><div className="text-[10px] text-muted-foreground uppercase">Received</div></Card>
          <Card className="p-3 text-center"><div className="text-lg font-mono font-bold text-[#DC143C]">${totalReferralValue.toLocaleString()}</div><div className="text-[10px] text-muted-foreground uppercase">Total Fees</div></Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="partners" className="text-xs"><Users className="w-3 h-3 mr-1" /> Partners ({partners.length})</TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs"><ArrowRightLeft className="w-3 h-3 mr-1" /> Referral Log ({referrals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search partners..." className="h-8 pl-8 text-xs" />
            </div>
            {filteredPartners.length === 0 ? (
              <Card className="p-8 text-center">
                <Handshake className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No partners yet. Add your first referral partner.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPartners.map((p) => {
                  const partnerReferrals = referrals.filter(r => r.partnerId === p.partnerId);
                  return (
                    <Card key={p.partnerId} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold">{p.name}</div>
                          {p.company && <div className="text-[10px] text-muted-foreground">{p.company}</div>}
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500" onClick={() => { if (confirm('Remove this partner?')) updatePartner.mutate({ partnerId: p.partnerId, updates: { notes: '[ARCHIVED]' } }); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {p.specialty && <Badge variant="outline" className="text-[9px] mb-2">{p.specialty}</Badge>}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {p.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</div>}
                        {p.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</div>}
                        {p.market && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.market}</div>}
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{partnerReferrals.length} referrals</span>
                        <span className="font-mono">${partnerReferrals.reduce((s, r) => s + (r.estimatedGCI || 0), 0).toLocaleString()}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Client</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Partner</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Direction</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => {
                      const partner = partners.find(p => p.partnerId === r.partnerId);
                      return (
                        <tr key={r.id} className="border-b hover:bg-muted/20">
                          <td className="p-3 font-medium">{r.contactName || '—'}</td>
                          <td className="p-3 text-muted-foreground hidden sm:table-cell">{partner?.name || '—'}</td>
                          <td className="p-3 text-center">
                            <Badge variant={r.direction === 'sent' ? 'default' : 'outline'} className="text-[10px]">
                              {r.direction === 'sent' ? '→ Sent' : '← Received'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                          </td>
                          <td className="p-3 text-right font-mono">${(r.estimatedGCI || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
