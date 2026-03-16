// Screen 11: Settings — BASIC PROFILE + PREFERENCES
// Design: "Command Center" — Clean settings layout
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Palette, Database, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const user = state.user;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile */}
        <Card className="p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#DC143C]" />
            Profile
          </h3>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#DC143C]" />
            Business Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
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
        </Card>

        {/* Notifications */}
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
              { label: 'Compliance screening alerts', description: 'Notifications for flagged content' },
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

        {/* Integrations */}
        <Card className="p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#DC143C]" />
            Integrations
          </h3>
          <div className="space-y-3">
            {[
              { name: 'CRM (Follow Up Boss, KW Command)', status: 'Not connected' },
              { name: 'MLS Feed', status: 'Not connected' },
              { name: 'Google Calendar', status: 'Not connected' },
              { name: 'Email (Gmail / Outlook)', status: 'Not connected' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div>
                  <div className="text-sm font-medium text-foreground">{integration.name}</div>
                  <div className="text-[10px] text-muted-foreground">{integration.status}</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.info('Feature coming soon')}>
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Data */}
        <Card className="p-6">
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#DC143C]" />
            Data & Privacy
          </h3>
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Feature coming soon')}>
              Export All Data
            </Button>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Your data is stored locally in your browser. No data is sent to external servers in this MVP version.
              All compliance screenings are performed client-side.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
