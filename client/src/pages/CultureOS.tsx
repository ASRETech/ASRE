// Screen 9: Culture OS — MISSION / VISION / VALUES GUIDED BUILDERS
// Design: "Command Center" — Guided builder with live preview
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart, Target, Eye, Star, Plus, X,
  Sparkles, BookOpen, Users, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const VALUE_SUGGESTIONS = [
  'Integrity', 'Excellence', 'Service', 'Growth', 'Accountability',
  'Innovation', 'Teamwork', 'Transparency', 'Compassion', 'Stewardship',
  'Faith', 'Discipline', 'Generosity', 'Courage', 'Humility',
];

const MISSION_PROMPTS = [
  'What problem do you solve for your clients?',
  'Who do you serve best?',
  'What makes your approach different?',
  'What outcome do your clients experience?',
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
          <TabsList className="bg-muted/50">
            <TabsTrigger value="mission" className="text-xs">
              <Target className="w-3.5 h-3.5 mr-1.5" /> Mission
            </TabsTrigger>
            <TabsTrigger value="vision" className="text-xs">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Vision
            </TabsTrigger>
            <TabsTrigger value="values" className="text-xs">
              <Star className="w-3.5 h-3.5 mr-1.5" /> Values
            </TabsTrigger>
            <TabsTrigger value="commitments" className="text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Team Commitments
            </TabsTrigger>
          </TabsList>

          {/* Mission Builder */}
          <TabsContent value="mission">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#DC143C]" />
                  Mission Statement
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your mission defines why your business exists and who it serves.
                </p>
                <Textarea
                  value={culture.missionStatement}
                  onChange={(e) => handleUpdateMission(e.target.value)}
                  placeholder="We exist to..."
                  className="min-h-[120px] text-base leading-relaxed"
                />
                <div className="mt-4 text-[10px] text-muted-foreground font-mono">
                  {culture.missionStatement.length} characters
                </div>
              </Card>

              {/* Prompts */}
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Guiding Questions</div>
                {MISSION_PROMPTS.map((prompt, i) => (
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

          {/* Vision Builder */}
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
                <div className="mt-4 text-[10px] text-muted-foreground font-mono">
                  {culture.visionStatement.length} characters
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

              {/* Current values */}
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

              {/* Suggestions */}
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

              {/* Custom value */}
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

              {/* Existing commitments */}
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
