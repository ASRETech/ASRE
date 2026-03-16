// Screen 10: Compliance — FAIR HOUSING AI SCREENER + AUDIT TRAIL
// Now connected to server AI endpoint via tRPC
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield, AlertTriangle, CheckCircle, Search,
  FileText, Eye, RefreshCw, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ScanResult {
  result: 'pass' | 'warning' | 'fail';
  flaggedItems: { text: string; reason: string; severity: 'low' | 'medium' | 'high' }[];
  summary: string;
}

export default function Compliance() {
  const [textToScreen, setTextToScreen] = useState('');
  const [screenResults, setScreenResults] = useState<ScanResult | null>(null);
  const [isScreening, setIsScreening] = useState(false);

  const utils = trpc.useUtils();

  // Fetch audit trail from server
  const { data: logs = [], isLoading: logsLoading } = trpc.compliance.list.useQuery();

  const scanMutation = trpc.compliance.scan.useMutation({
    onSuccess: (data) => {
      setScreenResults(data as ScanResult);
      setIsScreening(false);
      if (data.result === 'pass') {
        toast.success('No Fair Housing issues detected');
      } else {
        toast.warning(`${data.flaggedItems.length} issue(s) found`);
      }
      utils.compliance.list.invalidate();
    },
    onError: (err) => {
      setIsScreening(false);
      toast.error('Screening failed: ' + err.message);
    },
  });

  const handleScreen = () => {
    if (!textToScreen.trim()) {
      toast.error('Please enter text to screen');
      return;
    }
    setIsScreening(true);
    setScreenResults(null);
    scanMutation.mutate({ inputText: textToScreen });
  };

  const severityColor = (sev: string) => {
    if (sev === 'high') return 'bg-red-500/5 border-red-500/20 text-red-500';
    if (sev === 'medium') return 'bg-amber-500/5 border-amber-500/20 text-amber-500';
    return 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500';
  };

  const passCount = (logs as any[]).filter((l: any) => l.result === 'pass').length;
  const flaggedCount = (logs as any[]).length - passCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Status banner */}
        <Card className="p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="font-display font-semibold text-foreground">Compliance Status</div>
              <div className="text-xs text-muted-foreground">
                {(logs as any[]).length} screenings performed · {passCount} passed · {flaggedCount} flagged
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`font-mono text-xs ${
            flaggedCount === 0
              ? 'text-emerald-500 border-emerald-500/30'
              : 'text-amber-500 border-amber-500/30'
          }`}>
            {flaggedCount === 0 ? 'COMPLIANT' : 'REVIEW NEEDED'}
          </Badge>
        </Card>

        <Tabs defaultValue="screener" className="space-y-4">
          <TabsList className="bg-muted/50 w-full sm:w-auto">
            <TabsTrigger value="screener" className="text-xs flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 mr-1.5" /> AI Screener
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs flex-1 sm:flex-initial">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Audit Trail ({(logs as any[]).length})
            </TabsTrigger>
          </TabsList>

          {/* AI Screener */}
          <TabsContent value="screener">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#DC143C]" />
                  AI Fair Housing Screener
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste your listing description, marketing copy, or any client-facing text. Our AI analyzes for Fair Housing Act compliance in real-time.
                </p>
                <Textarea
                  value={textToScreen}
                  onChange={(e) => {
                    setTextToScreen(e.target.value);
                    setScreenResults(null);
                  }}
                  placeholder="Paste your listing description, ad copy, or email here..."
                  className="min-h-[200px] text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {textToScreen.length} characters
                  </span>
                  <Button
                    onClick={handleScreen}
                    disabled={isScreening || !textToScreen.trim()}
                    className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white"
                  >
                    {isScreening ? (
                      <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Screening...</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-1.5" /> Screen with AI</>
                    )}
                  </Button>
                </div>

                {/* Results */}
                {screenResults !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    {/* Summary */}
                    <div className={`p-4 rounded-xl border mb-4 ${
                      screenResults.result === 'pass'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : screenResults.result === 'warning'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        {screenResults.result === 'pass' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className={`w-5 h-5 ${screenResults.result === 'fail' ? 'text-red-500' : 'text-amber-500'}`} />
                        )}
                        <div>
                          <div className={`font-medium text-sm ${
                            screenResults.result === 'pass' ? 'text-emerald-600' :
                            screenResults.result === 'warning' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {screenResults.result === 'pass' ? 'All Clear' :
                             screenResults.result === 'warning' ? 'Potential Issues Found' : 'Violations Detected'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{screenResults.summary}</div>
                        </div>
                      </div>
                    </div>

                    {/* Flagged Items */}
                    {screenResults.flaggedItems.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                          {screenResults.flaggedItems.length} Issue(s) Found
                        </div>
                        {screenResults.flaggedItems.map((item, i) => (
                          <div key={i} className={`p-3 rounded-lg border ${severityColor(item.severity)}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium text-foreground">"{item.text}"</span>
                              <Badge variant="outline" className="text-[9px] font-mono">
                                {item.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>

              {/* Info panel */}
              <div className="space-y-3">
                <Card className="p-4">
                  <h4 className="font-display text-sm font-semibold mb-3">Protected Classes</h4>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {['Race', 'Color', 'National Origin', 'Religion', 'Sex', 'Familial Status', 'Disability'].map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-[#DC143C]" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono text-[#DC143C] border-[#DC143C]/20">AI</Badge>
                    <h4 className="font-display text-sm font-semibold">How It Works</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>1. Paste any client-facing text</li>
                    <li>2. AI analyzes for all 7 protected classes</li>
                    <li>3. Flags steering, exclusionary, or preferential language</li>
                    <li>4. Every scan is logged to your audit trail</li>
                    <li>5. Results are stored server-side for compliance records</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h4 className="font-display text-sm font-semibold mb-2">Quick Tips</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• Describe the property, not the ideal buyer</li>
                    <li>• Avoid neighborhood demographics</li>
                    <li>• Use "close to schools" not "family neighborhood"</li>
                    <li>• Don't mention churches, synagogues, etc.</li>
                    <li>• Describe accessibility features factually</li>
                  </ul>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Audit Trail — now from server */}
          <TabsContent value="audit">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#DC143C]" />
                  Audit Trail
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => utils.compliance.list.invalidate()}
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                </Button>
              </div>
              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (logs as any[]).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No screenings yet. Use the AI Screener to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(logs as any[]).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.result === 'pass'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {log.result === 'pass' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <Badge variant="outline" className={`text-[9px] font-mono ${
                            log.result === 'pass'
                              ? 'text-emerald-500 border-emerald-500/20'
                              : 'text-amber-500 border-amber-500/20'
                          }`}>
                            {log.result?.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{log.inputText}</p>
                        {log.flaggedItems && (log.flaggedItems as any[]).length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {(log.flaggedItems as any[]).map((item: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[9px] text-amber-500 border-amber-500/20">
                                {item.text || item}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
