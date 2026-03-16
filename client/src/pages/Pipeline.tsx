// Screen 5: Pipeline / Lead Management
// Design: "Command Center" — Kanban board with lead detail drawer
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { PIPELINE_STAGES, LEAD_SOURCES } from '@/lib/store';
import type { Lead } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Search, Phone, Mail, Calendar, Edit, ChevronRight,
  User, Clock, DollarSign, Tag, X, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const STAGE_COLORS: Record<string, string> = {
  'New Lead': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Contacted': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  'Qualified': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'Appt Set': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Appt Held': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Active': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Under Contract': 'bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20',
  'Closed': 'bg-green-600/10 text-green-600 border-green-600/20',
  'Nurture': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  'Dead': 'bg-gray-400/10 text-gray-400 border-gray-400/20',
};

const SOURCE_COLORS: Record<string, string> = {
  'Sphere of Influence': 'bg-emerald-500',
  'Open House': 'bg-amber-500',
  'Online Lead': 'bg-blue-500',
  'Referral': 'bg-violet-500',
  'Sign Call': 'bg-orange-500',
  'Social Media': 'bg-pink-500',
  'Past Client': 'bg-green-600',
  'Door Knock': 'bg-yellow-600',
  'Expired/FSBO': 'bg-red-500',
  'Paid Advertising': 'bg-cyan-500',
  'Other': 'bg-gray-500',
};

export default function Pipeline() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // New lead form state
  const [newLead, setNewLead] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    type: 'buyer' as Lead['type'], source: '', budget: '', timeline: '', notes: ''
  });

  const filteredLeads = state.leads.filter(l =>
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const kanbanStages = ['New Lead', 'Contacted', 'Qualified', 'Appt Set', 'Appt Held', 'Active', 'Under Contract'];

  const handleAddLead = () => {
    if (!newLead.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    const lead: Lead = {
      id: `lead-${nanoid(8)}`,
      firstName: newLead.firstName,
      lastName: newLead.lastName,
      email: newLead.email,
      phone: newLead.phone,
      type: newLead.type,
      source: newLead.source || 'Other',
      stage: 'New Lead',
      budget: parseInt(newLead.budget) || 0,
      timeline: newLead.timeline || 'Not specified',
      tags: [],
      lastContactedAt: new Date().toISOString(),
      nextAction: 'Initial contact',
      notes: newLead.notes,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LEAD', payload: lead });
    setShowAddLead(false);
    setNewLead({ firstName: '', lastName: '', email: '', phone: '', type: 'buyer', source: '', budget: '', timeline: '', notes: '' });
    toast.success('Lead added!', { description: `${lead.firstName} ${lead.lastName}` });
  };

  const handleMoveStage = (leadId: string, newStage: string) => {
    dispatch({ type: 'UPDATE_LEAD', payload: { id: leadId, updates: { stage: newStage } } });
    toast.success(`Moved to ${newStage}`);
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, stage: newStage });
    }
  };

  const daysSince = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-48px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="pl-9 w-full sm:w-64 h-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              List
            </button>
          </div>
        </div>
        <Button onClick={() => setShowAddLead(true)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white h-9 text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Lead
        </Button>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-3 h-full min-w-max pb-4">
            {kanbanStages.map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage);
              return (
                <div key={stage} className="w-[220px] flex flex-col shrink-0">
                  {/* Stage header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{stage}</span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center">
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-2">
                      {stageLeads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Card
                            className="p-3 cursor-pointer hover:border-border/80 hover:shadow-sm transition-all group"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-sm text-foreground truncate">
                                {lead.firstName} {lead.lastName}
                              </div>
                              <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${SOURCE_COLORS[lead.source] || 'bg-gray-400'}`} />
                            </div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-mono border ${
                                lead.type === 'buyer' ? 'text-blue-500 border-blue-500/20' :
                                lead.type === 'seller' ? 'text-emerald-500 border-emerald-500/20' :
                                'text-violet-500 border-violet-500/20'
                              }`}>
                                {lead.type.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground truncate">{lead.source}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {daysSince(lead.lastContactedAt)}d ago
                              </span>
                              {lead.budget > 0 && (
                                <span className="font-mono">${(lead.budget / 1000).toFixed(0)}K</span>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Contact</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="py-2.5 font-medium">{lead.firstName} {lead.lastName}</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="text-[10px] font-mono">{lead.type}</Badge>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${SOURCE_COLORS[lead.source] || 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground">{lead.source}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <Badge variant="outline" className={`text-[10px] font-mono ${STAGE_COLORS[lead.stage] || ''}`}>
                      {lead.stage}
                    </Badge>
                  </td>
                  <td className="py-2.5 font-mono text-xs">{lead.budget > 0 ? `$${(lead.budget / 1000).toFixed(0)}K` : '—'}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{daysSince(lead.lastContactedAt)}d ago</td>
                  <td className="py-2.5 text-xs text-muted-foreground truncate max-w-[150px]">{lead.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Detail Drawer */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="w-full sm:w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle className="font-display">
              {selectedLead?.firstName} {selectedLead?.lastName}
            </SheetTitle>
            <SheetDescription>Lead details and activity</SheetDescription>
          </SheetHeader>
          {selectedLead && (
            <div className="mt-4 space-y-4">
              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">${selectedLead.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.timeline}</span>
                </div>
              </div>

              {/* Stage selector */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Stage</Label>
                <Select value={selectedLead.stage} onValueChange={(v) => handleMoveStage(selectedLead.id, v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => toast.info('Feature coming soon')}>
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Log Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => toast.info('Feature coming soon')}>
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => toast.info('Feature coming soon')}>
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Appt
                </Button>
              </div>

              {/* Source and type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Source</Label>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${SOURCE_COLORS[selectedLead.source] || 'bg-gray-400'}`} />
                    <span className="text-sm">{selectedLead.source}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Type</Label>
                  <Badge variant="outline" className="text-xs font-mono">{selectedLead.type}</Badge>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</Label>
                <Textarea
                  value={selectedLead.notes}
                  onChange={(e) => {
                    dispatch({ type: 'UPDATE_LEAD', payload: { id: selectedLead.id, updates: { notes: e.target.value } } });
                    setSelectedLead({ ...selectedLead, notes: e.target.value });
                  }}
                  placeholder="Add notes..."
                  className="text-sm min-h-[80px]"
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">First Name *</Label>
                <Input value={newLead.firstName} onChange={(e) => setNewLead(p => ({ ...p, firstName: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Last Name</Label>
                <Input value={newLead.lastName} onChange={(e) => setNewLead(p => ({ ...p, lastName: e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Email</Label>
                <Input value={newLead.email} onChange={(e) => setNewLead(p => ({ ...p, email: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Phone</Label>
                <Input value={newLead.phone} onChange={(e) => setNewLead(p => ({ ...p, phone: e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Type</Label>
                <Select value={newLead.type} onValueChange={(v) => setNewLead(p => ({ ...p, type: v as Lead['type'] }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="renter">Renter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Source</Label>
                <Select value={newLead.source} onValueChange={(v) => setNewLead(p => ({ ...p, source: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Budget</Label>
                <Input type="number" value={newLead.budget} onChange={(e) => setNewLead(p => ({ ...p, budget: e.target.value }))} placeholder="350000" className="h-9 font-mono" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Timeline</Label>
                <Select value={newLead.timeline} onValueChange={(v) => setNewLead(p => ({ ...p, timeline: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3 months">0-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="12+ months">12+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Notes</Label>
              <Textarea value={newLead.notes} onChange={(e) => setNewLead(p => ({ ...p, notes: e.target.value }))} className="min-h-[60px] text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLead(false)}>Cancel</Button>
            <Button onClick={handleAddLead} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">Add Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
