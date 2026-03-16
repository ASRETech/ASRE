// Screen 9: Culture OS — MISSION / VISION / VALUES GUIDED BUILDERS
// Now with AI Mission Statement generation via guided questions
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart, Target, Eye, Star, Plus, X,
  Sparkles, BookOpen, Users, Check, Loader2, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const VALUE_SUGGESTIONS = [
  'Integrity', 'Excellence', 'Service', 'Growth', 'Accountability',
  'Innovation', 'Teamwork', 'Transparency', 'Compassion', 'Stewardship',
  'Faith', 'Discipline', 'Generosity', 'Courage', 'Humility',
];

const VISION_PROMPTS = [
  'Where do you see your business in 5 years?',
  'What impact do you want to have on your community?',
  'What legacy do you want to build?',
  'What does success look like at scale?',
];

export default function CultureOS() {
  const { state, dispatch } = useApp();
  const culture = state.cultureDoc;
  const [newValue, setNewValue] = useState('');
  const [newCommitment, setNewCommitment] = useState('');

  // AI Mission builder state
  const [missionAnswers, setMissionAnswers] = useState({
    problem: '',
    bestClient: '',
    community: '',
    purpose: '',
  });
  const [missionGenerating, setMissionGenerating] = useState(false);
  const coachMutation = trpc.coaching.ask.useMutation();

  const allMissionAnswered = Object.values(missionAnswers).every(a => a.trim().length > 5);

  const generateMission = () => {
    if (!allMissionAnswered) {
      toast.error('Please answer all 4 questions first (at least 6 characters each)');
      return;
    }
    setMissionGenerating(true);
    coachMutation.mutate({
      context: 'mission-builder',
      prompt: `Write a powerful, authentic mission statement (1-2 sentences) for a real estate team based on these answers:
1. Problem solved: ${missionAnswers.problem}
2. Client testimonial: ${missionAnswers.bestClient}
3. Community impact: ${missionAnswers.community}
4. Core purpose: ${missionAnswers.purpose}
Return ONLY the mission statement. No explanation. No quotes. No preamble.`,
      agentLevel: state.user?.currentLevel,
    }, {
      onSuccess: (data) => {
        dispatch({ type: 'UPDATE_CULTURE', payload: { missionStatement: data.response } });
        setMissionGenerating(false);
        toast.success('Mission statement generated');
      },
      onError: () => {
        setMissionGenerating(false);
        toast.error('Could not generate mission statement');
      },
    });
  };

  // AI Vision builder
  const [visionGenerating, setVisionGenerating] = useState(false);
  const generateVision = () => {
    if (!culture.missionStatement.trim()) {
      toast.error('Write or generate a mission statement first');
      return;
    }
    setVisionGenerating(true);
    coachMutation.mutate({
      context: 'vision-builder',
      prompt: `Write a compelling, aspirational vision statement (1-2 sentences) for a real estate team whose mission is: "${culture.missionStatement}". The vision should paint a picture of the future. Return ONLY the vision statement. No explanation. No quotes. No preamble.`,
      agentLevel: state.user?.currentLevel,
    }, {
      onSuccess: (data) => {
        dispatch({ type: 'UPDATE_CULTURE', payload: { visionStatement: data.response } });
        setVisionGenerating(false);
        toast.success('Vision statement generated');
      },
      onError: () => {
        setVisionGenerating(false);
        toast.error('Could not generate vision statement');
      },
    });
  };

  const handleUpdateMission = (value: string) => {
    dispatch({ type: 'UPDATE_CULTURE', payload: { missionStatement: value } });
  };

  const handleUpdateVision = (value: string) => {
    dispatch({ type: 'UPDATE_CULTURE', payload: { visionStatement: value } });
  };

  const handleAddValue = (value: string) => {
    if (!value.trim()) return;
    if (culture.coreValues.includes(value.trim())) {
      toast.error('Value already exists');
      return;
    }
    dispatch({ type: 'UPDATE_CULTURE', payload: { coreValues: [...culture.coreValues, value.trim()] } });
    setNewValue('');
    toast.success('Value added!');
  };

  const handleRemoveValue = (value: string) => {
    dispatch({ type: 'UPDATE_CULTURE', payload: { coreValues: culture.coreValues.filter(v => v !== value) } });
  };

  const handleAddCommitment = () => {
    if (!newCommitment.trim()) return;
    dispatch({ type: 'UPDATE_CULTURE', payload: { teamCommitments: [...culture.teamCommitments, newCommitment.trim()] } });
    setNewCommitment('');
    toast.success('Commitment added!');
  };

  const handleRemoveCommitment = (index: number) => {
    dispatch({ type: 'UPDATE_CULTURE', payload: { teamCommitments: culture.teamCommitments.filter((_, i) => i !== index) } });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="mission" className="space-y-4">
          <TabsList className="bg-muted/50 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="mission" className="text-xs flex-1 sm:flex-initial">
              <Target className="w-3.5 h-3.5 mr-1.5" /> Mission
            </TabsTrigger>
            <TabsTrigger value="vision" className="text-xs flex-1 sm:flex-initial">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Vision
            </TabsTrigger>
            <TabsTrigger value="values" className="text-xs flex-1 sm:flex-initial">
              <Star className="w-3.5 h-3.5 mr-1.5" /> Values
            </TabsTrigger>
            <TabsTrigger value="commitments" className="text-xs flex-1 sm:flex-initial">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Team Commitments
            </TabsTrigger>
          </TabsList>

          {/* Mission Builder — Now with AI */}
          <TabsContent value="mission">
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#DC143C]" />
                  Mission Statement
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your mission defines why your business exists and who it serves.
                </p>

                {/* Current mission (editable) */}
                <Textarea
                  value={culture.missionStatement}
                  onChange={(e) => handleUpdateMission(e.target.value)}
                  placeholder="We exist to..."
                  className="min-h-[100px] text-base leading-relaxed mb-2"
                />
                <div className="text-[10px] text-muted-foreground font-mono mb-6">
                  {culture.missionStatement.length} characters
                </div>

                {/* Guided AI Builder */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-[10px] font-mono text-[#DC143C] border-[#DC143C]/20">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI
                    </Badge>
                    <h4 className="font-display text-sm font-semibold">Generate with AI</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Answer these 4 questions and we'll craft a mission statement for you.
                  </p>

                  <div className="space-y-4">
                    {[
                      { key: 'problem', label: '1. What problem does your team uniquely solve?', placeholder: 'e.g., Families struggle to find homes that fit their budget and lifestyle' },
                      { key: 'bestClient', label: '2. What would your best client say about working with you?', placeholder: 'e.g., They made the process stress-free and found us our dream home' },
                      { key: 'community', label: '3. What would your community lose if you didn\'t exist?', placeholder: 'e.g., A trusted advisor who puts families first over commissions' },
                      { key: 'purpose', label: '4. Complete: We exist to ___________', placeholder: 'e.g., help families build wealth through homeownership' },
                    ].map(q => (
                      <div key={q.key}>
                        <Label className="text-xs font-medium text-foreground mb-1.5 block">{q.label}</Label>
                        <Input
                          value={(missionAnswers as any)[q.key]}
                          onChange={e => setMissionAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                          placeholder={q.placeholder}
                          className="h-9 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={generateMission}
                      disabled={!allMissionAnswered || missionGenerating}
                      className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white"
                    >
                      {missionGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-1.5" /> Generate Mission</>
                      )}
                    </Button>
                    {culture.missionStatement && (
                      <Button
                        variant="outline"
                        onClick={generateMission}
                        disabled={!allMissionAnswered || missionGenerating}
                        size="sm"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Tips panel */}
              <div className="space-y-3">
                <Card className="p-4">
                  <h4 className="font-display text-sm font-semibold mb-3">Great Mission Statements</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> Are 1-2 sentences max</li>
                    <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> State who you serve</li>
                    <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> Describe the transformation</li>
                    <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> Feel authentic to your team</li>
                    <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> Are memorable and quotable</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h4 className="font-display text-sm font-semibold mb-2">Examples</h4>
                  <div className="space-y-2 text-xs text-muted-foreground italic">
                    <p>"We exist to help families build lasting wealth through strategic homeownership, one relationship at a time."</p>
                    <p>"To be the most trusted real estate team in our community by putting client outcomes above everything else."</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Vision Builder — Now with AI */}
          <TabsContent value="vision">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#DC143C]" />
                  Vision Statement
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your vision paints the picture of where you're heading.
                </p>
                <Textarea
                  value={culture.visionStatement}
                  onChange={(e) => handleUpdateVision(e.target.value)}
                  placeholder="We envision a future where..."
                  className="min-h-[120px] text-base leading-relaxed"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {culture.visionStatement.length} characters
                  </span>
                  <Button
                    onClick={generateVision}
                    disabled={visionGenerating || !culture.missionStatement.trim()}
                    size="sm"
                    className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white text-xs"
                  >
                    {visionGenerating ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3 h-3 mr-1" /> Generate with AI</>
                    )}
                  </Button>
                </div>
              </Card>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Guiding Questions</div>
                {VISION_PROMPTS.map((prompt, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#DC143C] mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Values Builder */}
          <TabsContent value="values">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#DC143C]" />
                Core Values
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Select or create the values that define how your team operates.
              </p>

              {culture.coreValues.length > 0 && (
                <div className="mb-6">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Your Values</Label>
                  <div className="flex flex-wrap gap-2">
                    {culture.coreValues.map((value) => (
                      <Badge key={value} variant="default" className="bg-[#DC143C]/10 text-[#DC143C] border border-[#DC143C]/20 text-sm px-3 py-1">
                        {value}
                        <button onClick={() => handleRemoveValue(value)} className="ml-2 hover:text-[#DC143C]/60">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Suggestions</Label>
                <div className="flex flex-wrap gap-1.5">
                  {VALUE_SUGGESTIONS.filter(v => !culture.coreValues.includes(v)).map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAddValue(value)}
                      className="px-3 py-1 rounded-lg text-xs bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition-all"
                    >
                      <Plus className="w-2.5 h-2.5 inline mr-1" />
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Add a custom value..."
                  className="h-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddValue(newValue)}
                />
                <Button onClick={() => handleAddValue(newValue)} variant="outline" size="sm" className="h-9 px-4">
                  Add
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Team Commitments */}
          <TabsContent value="commitments">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#DC143C]" />
                Team Commitments
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Define the non-negotiable behaviors and standards for your team.
              </p>

              <div className="space-y-2 mb-4">
                {culture.teamCommitments.map((commitment, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-foreground flex-1">{commitment}</span>
                    <button onClick={() => handleRemoveCommitment(i)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
                {culture.teamCommitments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No commitments yet. Add your first team commitment below.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newCommitment}
                  onChange={(e) => setNewCommitment(e.target.value)}
                  placeholder="e.g., We respond to all leads within 5 minutes"
                  className="h-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCommitment()}
                />
                <Button onClick={handleAddCommitment} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white h-9 px-4">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
