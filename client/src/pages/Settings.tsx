// Screen 11: Settings — Profile, Calendar, Brokerage Config, Notifications, Integrations
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Calendar, Building2, Shield, Zap, Save, Check, Palette, Crown, HardDrive } from 'lucide-react';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const user = state.user;

  // Calendar sync state
  const [calProvider, setCalProvider] = useState('google');
  const [calId, setCalId] = useState('');
  const [calSync, setCalSync] = useState(false);

  // Brokerage config state
  const [brokerageName, setBrokerageName] = useState('Keller Williams');
  const [brandColor, setBrandColor] = useState('#B5121B');
  const [frameworkName, setFrameworkName] = useState('MREA');
  const [levelNames, setLevelNames] = useState([
    'Solo Agent', 'First Admin Hire', "First Buyer's Agent",
    "Multiple Buyer's Agents", 'Listings Specialist', 'Full Team', 'Business Owner'
  ]);
  const [valuesFramework, setValuesFramework] = useState('WI4C2TES');
  const [showKWContent, setShowKWContent] = useState(true);
  const [coachingProgramName, setCoachingProgramName] = useState('BOLD / Productivity Coaching');

  // Google Drive state
  const driveStatus = trpc.drive.getStatus.useQuery(undefined, { retry: false });
  const driveAuthUrl = trpc.drive.getAuthUrl.useQuery(undefined, { retry: false });

  const calendarMutation = trpc.calendar.upsertToken.useMutation({
    onSuccess: () => toast.success('Calendar settings saved'),
    onError: () => toast.error('Failed to save calendar settings'),
  });

  const brokerageMutation = trpc.brokerageConfig.upsert.useMutation({
    onSuccess: () => toast.success('Brokerage config saved'),
    onError: () => toast.error('Failed to save brokerage config'),
  });

  const profileMutation = trpc.profile.upsert.useMutation({
    onSuccess: () => toast.success('Profile saved'),
    onError: () => toast.error('Failed to save profile'),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="profile" className="text-xs"><User className="w-3 h-3 mr-1" /> Profile</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs"><Calendar className="w-3 h-3 mr-1" /> Calendar</TabsTrigger>
            <TabsTrigger value="brokerage" className="text-xs"><Building2 className="w-3 h-3 mr-1" /> Brokerage</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs"><Bell className="w-3 h-3 mr-1" /> Notifications</TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs"><Crown className="w-3 h-3 mr-1" /> Subscription</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs"><Zap className="w-3 h-3 mr-1" /> Integrations</TabsTrigger>
          </TabsList>

          {/* ====== SUBSCRIPTION TAB ====== */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionCard />
          </TabsContent>

          {/* ====== PROFILE TAB ====== */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#DC143C]" />
                Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Name</Label>
                  <Input
                    value={user?.name || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_USER', payload: { name: e.target.value } })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Brokerage</Label>
                  <Input
                    value={user?.brokerage || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_USER', payload: { brokerage: e.target.value } })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Market Center</Label>
                  <Input
                    value={user?.marketCenter || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_USER', payload: { marketCenter: e.target.value } })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">State</Label>
                  <Input
                    value={user?.state || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_USER', payload: { state: e.target.value } })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">GCI Goal</Label>
                  <Input
                    type="number"
                    value={user?.incomeGoal || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_USER', payload: { incomeGoal: parseInt(e.target.value) || 0 } })}
                    className="h-9 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Team Size</Label>
                  <Input
                    type="number"
                    value={user?.teamSize || ''}
                    onChange={(e) => dispatch({ type: 'UPDATE_USER', payload: { teamSize: parseInt(e.target.value) || 1 } })}
                    className="h-9 font-mono"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                  onClick={() => {
                    profileMutation.mutate({
                      name: user?.name,
                      brokerage: user?.brokerage,
                      marketCenter: user?.marketCenter,
                      state: user?.state,
                      incomeGoal: user?.incomeGoal,
                      teamSize: user?.teamSize,
                    });
                  }}
                >
                  <Save className="w-3 h-3 mr-1" /> Save Profile
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#DC143C]" />
                Data & Privacy
              </h3>
              <p className="text-xs text-muted-foreground">
                Your data is stored securely in the AgentOS database.
                You can export your data at any time.
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Feature coming soon')}>
                  Export All Data
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* ====== CALENDAR TAB ====== */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#DC143C]" />
                Calendar Sync
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Connect your calendar to sync time-blocking templates, transaction deadlines, and lead follow-up reminders.
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Provider</Label>
                  <Select value={calProvider} onValueChange={setCalProvider}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Calendar</SelectItem>
                      <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                      <SelectItem value="apple">Apple Calendar (iCal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Calendar ID / Email</Label>
                  <Input
                    value={calId}
                    onChange={(e) => setCalId(e.target.value)}
                    placeholder="your@email.com"
                    className="h-9"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <div className="text-sm font-medium">Enable Sync</div>
                    <div className="text-[10px] text-muted-foreground">Auto-sync time blocks and deadlines</div>
                  </div>
                  <Switch checked={calSync} onCheckedChange={setCalSync} />
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Calendar sync is currently in preview. Full OAuth-based sync with Google Calendar will be available in a future update.
                    For now, settings are saved for when the integration goes live.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                    onClick={() => {
                      calendarMutation.mutate({
                        provider: calProvider,
                        calendarId: calId,
                        syncEnabled: calSync,
                      });
                    }}
                  >
                    <Save className="w-3 h-3 mr-1" /> Save Calendar Settings
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ====== BROKERAGE CONFIG TAB ====== */}
          <TabsContent value="brokerage" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#DC143C]" />
                Brokerage Configuration
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Customize AgentOS for your brokerage. Rename levels, adjust branding, and configure framework terminology.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Brokerage Name</Label>
                    <Input value={brokerageName} onChange={(e) => setBrokerageName(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Brand Color</Label>
                    <div className="flex gap-2">
                      <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-9 flex-1" />
                      <div className="w-9 h-9 rounded border border-border" style={{ backgroundColor: brandColor }} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Framework Name</Label>
                  <Input value={frameworkName} onChange={(e) => setFrameworkName(e.target.value)} className="h-9" placeholder="MREA" />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Level Names</Label>
                  <div className="space-y-2">
                    {levelNames.map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16 shrink-0">Level {i + 1}</span>
                        <Input
                          value={name}
                          onChange={(e) => {
                            const updated = [...levelNames];
                            updated[i] = e.target.value;
                            setLevelNames(updated);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Values Framework</Label>
                    <Input value={valuesFramework} onChange={(e) => setValuesFramework(e.target.value)} className="h-9" placeholder="WI4C2TES" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Coaching Program Name</Label>
                    <Input value={coachingProgramName} onChange={(e) => setCoachingProgramName(e.target.value)} className="h-9" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <div className="text-sm font-medium">Show KW-Specific Content</div>
                    <div className="text-[10px] text-muted-foreground">Include KW models, terminology, and references</div>
                  </div>
                  <Switch checked={showKWContent} onCheckedChange={setShowKWContent} />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                    onClick={() => {
                      brokerageMutation.mutate({
                        brokerageName,
                        brandColor,
                        frameworkName,
                        level1Name: levelNames[0],
                        level2Name: levelNames[1],
                        level3Name: levelNames[2],
                        level4Name: levelNames[3],
                        level5Name: levelNames[4],
                        level6Name: levelNames[5],
                        level7Name: levelNames[6],
                        valuesFramework,
                        showKWContent,
                        coachingProgramName,
                      });
                    }}
                  >
                    <Save className="w-3 h-3 mr-1" /> Save Brokerage Config
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ====== NOTIFICATIONS TAB ====== */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#DC143C]" />
                Notifications
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Lead follow-up reminders', description: 'Get notified when a lead needs attention' },
                  { label: 'Transaction milestone alerts', description: 'Alerts for upcoming deadlines' },
                  { label: 'Weekly performance digest', description: 'Summary of your weekly metrics' },
                  { label: 'Coach comments', description: 'Notifications when your coach leaves feedback' },
                  { label: 'Review requests', description: 'Reminders to request reviews after closings' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast.info('Feature coming soon')} />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ====== INTEGRATIONS TAB ====== */}
          <TabsContent value="integrations">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#DC143C]" />
                Integrations
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'CRM (Follow Up Boss, KW Command)', status: 'Not connected', available: false },
                  { name: 'MLS Feed', status: 'Not connected', available: false },
                  { name: 'Google Calendar', status: calSync ? 'Settings saved' : 'Not connected', available: true },
                  { name: 'Email (Gmail / Outlook)', status: 'Not connected', available: false },
                  { name: 'Google Business Profile', status: 'Not connected', available: false },
                  { name: 'Zillow Reviews', status: 'Not connected', available: false },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <div className="text-sm font-medium text-foreground">{integration.name}</div>
                      <div className="text-[10px] text-muted-foreground">{integration.status}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        if (integration.name === 'Google Calendar') {
                          toast.info('Configure in the Calendar tab');
                        } else {
                          toast.info('Feature coming soon');
                        }
                      }}
                    >
                      {integration.available ? <Check className="w-3 h-3 mr-1" /> : null}
                      {integration.available ? 'Configured' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>

                {/* Google Drive — live OAuth integration */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#DC143C]" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Google Drive</div>
                      <div className="text-[10px] text-muted-foreground">
                        {driveStatus.isLoading ? 'Checking...' :
                          driveStatus.data?.connected
                            ? driveStatus.data.hasFolders ? '✓ Connected — AgentOS folder provisioned' : '✓ Connected — provisioning folders...'
                            : 'Not connected — click to authorize'}
                      </div>
                    </div>
                  </div>
                  {driveStatus.data?.connected ? (
                    <Button variant="outline" size="sm" className="text-xs h-7 border-green-500 text-green-400" disabled>
                      <Check className="w-3 h-3 mr-1" /> Connected
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      disabled={!driveAuthUrl.data?.url}
                      onClick={() => {
                        if (driveAuthUrl.data?.url) {
                          window.location.href = driveAuthUrl.data.url;
                        } else {
                          toast.error('Google Drive is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Railway.');
                        }
                      }}
                    >
                      <HardDrive className="w-3 h-3 mr-1" /> Connect Drive
                    </Button>
                  )}
                </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
