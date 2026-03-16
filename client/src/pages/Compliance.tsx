// Screen 10: Compliance — FAIR HOUSING AI SCREENER + AUDIT TRAIL
// Design: "Command Center" — Text screener with audit log
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { ComplianceLog } from '@/lib/store';
import { FAIR_HOUSING_KEYWORDS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, AlertTriangle, CheckCircle, Search,
  FileText, Clock, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface ScreenResult {
  word: string;
  suggestion: string;
  severity: 'warning' | 'violation';
  position: number;
}

function screenText(text: string): ScreenResult[] {
  const results: ScreenResult[] = [];
  const lowerText = text.toLowerCase();

  FAIR_HOUSING_KEYWORDS.forEach((kw) => {
    const idx = lowerText.indexOf(kw.word.toLowerCase());
    if (idx !== -1) {
      results.push({
        word: kw.word,
        suggestion: kw.suggestion,
        severity: kw.severity,
        position: idx,
      });
    }
  });

  return results;
}

export default function Compliance() {
  const { state, dispatch } = useApp();
  const [textToScreen, setTextToScreen] = useState('');
  const [screenResults, setScreenResults] = useState<ScreenResult[] | null>(null);
  const [isScreening, setIsScreening] = useState(false);

  const handleScreen = () => {
    if (!textToScreen.trim()) {
      toast.error('Please enter text to screen');
      return;
    }
    setIsScreening(true);

    // Simulate brief processing delay
    setTimeout(() => {
      const results = screenText(textToScreen);
      setScreenResults(results);
      setIsScreening(false);

      // Log the screening
      const log: ComplianceLog = {
        id: `comp-${nanoid(8)}`,
        type: 'fair-housing-screen',
        inputText: textToScreen.substring(0, 200),
        flaggedTerms: results.map(r => r.word),
        result: results.length === 0 ? 'pass' : 'flagged',
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_COMPLIANCE_LOG', payload: log });

      if (results.length === 0) {
        toast.success('No Fair Housing issues detected!');
      } else {
        toast.warning(`${results.length} potential issue(s) found`);
      }
    }, 800);
  };

  const logs = state.complianceLogs;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Status banner */}
        <Card className="p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="font-display font-semibold text-foreground">Compliance Status</div>
              <div className="text-xs text-muted-foreground">{logs.length} screenings performed</div>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-mono text-xs">
            COMPLIANT
          </Badge>
        </Card>

        <Tabs defaultValue="screener" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="screener" className="text-xs">
              <Search className="w-3.5 h-3.5 mr-1.5" /> Fair Housing Screener
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Audit Trail ({logs.length})
            </TabsTrigger>
          </TabsList>

          {/* Screener */}
          <TabsContent value="screener">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#DC143C]" />
                  Text Screener
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste your listing description, marketing copy, or any client-facing text to check for Fair Housing compliance.
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
                      <>Screening...</>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1.5" />
                        Screen Text
                      </>
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
                    {screenResults.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <div>
                          <div className="font-medium text-emerald-600 text-sm">All Clear</div>
                          <div className="text-xs text-muted-foreground">No Fair Housing issues detected in this text.</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                          {screenResults.length} Issue(s) Found
                        </div>
                        {screenResults.map((result, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border ${
                              result.severity === 'violation'
                                ? 'bg-red-500/5 border-red-500/20'
                                : 'bg-amber-500/5 border-amber-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className={`w-4 h-4 ${
                                result.severity === 'violation' ? 'text-red-500' : 'text-amber-500'
                              }`} />
                              <span className="text-sm font-medium text-foreground">
                                "{result.word}"
                              </span>
                              <Badge variant="outline" className={`text-[9px] font-mono ${
                                result.severity === 'violation'
                                  ? 'text-red-500 border-red-500/20'
                                  : 'text-amber-500 border-amber-500/20'
                              }`}>
                                {result.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">{result.suggestion}</p>
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

          {/* Audit Trail */}
          <TabsContent value="audit">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#DC143C]" />
                Audit Trail
              </h3>
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No screenings yet. Use the Fair Housing Screener to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.result === 'pass'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {log.result === 'pass' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] font-mono ${
                            log.result === 'pass'
                              ? 'text-emerald-500 border-emerald-500/20'
                              : 'text-amber-500 border-amber-500/20'
                          }`}>
                            {log.result.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{log.inputText}</p>
                        {log.flaggedTerms.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {log.flaggedTerms.map((term, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] text-amber-500 border-amber-500/20">
                                {term}
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
