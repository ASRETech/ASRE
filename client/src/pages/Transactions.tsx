// Screen 6: Transaction Engine — BASIC CHECKLIST-DRIVEN
// Design: "Command Center" — Card grid with transaction detail view
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Transaction } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Home, Calendar, DollarSign, User, Clock,
  ChevronRight, FileText, Building, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  'pre-contract': { label: 'Pre-Contract', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'under-contract': { label: 'Under Contract', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  'clear-to-close': { label: 'Clear to Close', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  'closed': { label: 'Closed', color: 'bg-green-600/10 text-green-600 border-green-600/20' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export default function Transactions() {
  const { state, dispatch } = useApp();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const transactions = state.transactions;
  const activeCount = transactions.filter(t => t.status !== 'closed' && t.status !== 'cancelled').length;
  const totalPipelineGCI = transactions.filter(t => t.status !== 'closed' && t.status !== 'cancelled')
    .reduce((s, t) => s + t.projectedGCI, 0);

  const getChecklistProgress = (txn: Transaction) => {
    const total = txn.checklistItems.length;
    const done = txn.checklistItems.filter(c => c.isComplete).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const daysUntilClose = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const handleToggleChecklist = (txnId: string, itemId: string) => {
    const txn = transactions.find(t => t.id === txnId);
    if (!txn) return;
    const updatedItems = txn.checklistItems.map(c =>
      c.id === itemId ? { ...c, isComplete: !c.isComplete } : c
    );
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id: txnId, updates: { checklistItems: updatedItems } } });
    if (selectedTxn?.id === txnId) {
      setSelectedTxn({ ...selectedTxn, checklistItems: updatedItems });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Active Transactions</div>
            <div className="font-mono text-2xl font-bold text-foreground">{activeCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pipeline GCI</div>
            <div className="font-mono text-2xl font-bold text-[#DC143C]">${totalPipelineGCI.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Closed YTD</div>
            <div className="font-mono text-2xl font-bold text-emerald-500">
              {transactions.filter(t => t.status === 'closed').length}
            </div>
          </Card>
        </div>

        {/* Transaction cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {transactions.map((txn, i) => {
            const progress = getChecklistProgress(txn);
            const statusInfo = STATUS_STYLES[txn.status] || STATUS_STYLES['pre-contract'];
            const days = daysUntilClose(txn.closeDate);

            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:border-border/80 hover:shadow-sm transition-all"
                  onClick={() => setSelectedTxn(txn)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Home className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground truncate max-w-[160px]">{txn.propertyAddress.split(',')[0]}</div>
                        <div className="text-[10px] text-muted-foreground">{txn.clientName}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-mono ${statusInfo.color}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-mono">${txn.salePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                        {txn.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{days}d to close</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#DC143C] font-semibold">${txn.projectedGCI.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">GCI</span>
                    </div>
                  </div>

                  {/* Checklist progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Checklist</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Transaction Detail Drawer */}
        <Sheet open={!!selectedTxn} onOpenChange={() => setSelectedTxn(null)}>
          <SheetContent className="w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display">{selectedTxn?.propertyAddress}</SheetTitle>
              <SheetDescription>{selectedTxn?.clientName} — {selectedTxn?.type.toUpperCase()}</SheetDescription>
            </SheetHeader>
            {selectedTxn && (
              <div className="mt-4 space-y-5">
                {/* Key info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Sale Price</div>
                    <div className="font-mono text-lg font-bold">${selectedTxn.salePrice.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Projected GCI</div>
                    <div className="font-mono text-lg font-bold text-[#DC143C]">${selectedTxn.projectedGCI.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">MLS #</span>
                    <span className="font-mono">{selectedTxn.mlsNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Commission</span>
                    <span className="font-mono">{selectedTxn.commissionRate}% / {selectedTxn.brokerageSplit}% split</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Lender</span>
                    <span>{selectedTxn.lenderContact}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Title</span>
                    <span>{selectedTxn.titleCompany}</span>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <h4 className="font-display text-sm font-semibold mb-3">Transaction Checklist</h4>
                  <div className="space-y-1.5">
                    {selectedTxn.checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                          item.isComplete ? 'bg-emerald-500/[0.03]' : 'hover:bg-muted/30'
                        }`}
                      >
                        <Checkbox
                          checked={item.isComplete}
                          onCheckedChange={() => handleToggleChecklist(selectedTxn.id, item.id)}
                          className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                        <div className="flex-1">
                          <span className={`text-sm ${item.isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-2">{item.section}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
