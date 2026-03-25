import { useState } from "react";
import { Calendar, Bell, Clock, Users, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CalendarSettingsProps {
  onConnect: () => void;
}

export function CalendarSettings({ onConnect }: CalendarSettingsProps) {
  const { data: status } = trpc.calendar.getStatus.useQuery();
  const { data: settings } = trpc.calendar.getSettings.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.calendar.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      utils.calendar.getSettings.invalidate();
      utils.calendar.getStatus.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const [leadGenEnabled, setLeadGenEnabled] = useState(settings?.leadGenEnabled ?? true);
  const [leadGenStartTime, setLeadGenStartTime] = useState(settings?.leadGenStartTime ?? "08:00");
  const [requireApproval, setRequireApproval] = useState(settings?.requireApprovalBeforePush ?? true);
  const [notifyFinancial, setNotifyFinancial] = useState(settings?.notifyFinancialDeadlines ?? true);
  const [notifyMilestones, setNotifyMilestones] = useState(settings?.notifyMilestones ?? true);
  const [notifyDeliverables, setNotifyDeliverables] = useState(settings?.notifyDeliverables ?? true);
  const [notifyPulse, setNotifyPulse] = useState(settings?.notifyPulseReminder ?? true);
  const [pulseTime, setPulseTime] = useState(settings?.pulseReminderTime ?? "17:00");

  const handleSave = () => {
    updateMutation.mutate({
      leadGenEnabled,
      leadGenStartTime,
      requireApprovalBeforePush: requireApproval,
      notifyFinancialDeadlines: notifyFinancial,
      notifyMilestones,
      notifyDeliverables,
      notifyPulseReminder: notifyPulse,
      pulseReminderTime: pulseTime,
    });
  };

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <Card className="bg-muted/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Google Calendar Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-400 font-medium">Connected</p>
                {status.settings?.gcalCalendarId && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">ASRE calendar provisioned</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={onConnect}
                className="border-border text-muted-foreground hover:text-foreground text-xs">
                Reconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Not connected</p>
              <Button size="sm" onClick={onConnect} className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
                Connect Calendar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Gen Settings */}
      <Card className="bg-muted/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Users className="w-4 h-4" /> Lead Generation Blocks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground/80">Enable lead gen time blocks</Label>
            <Switch checked={leadGenEnabled} onCheckedChange={setLeadGenEnabled} />
          </div>
          {leadGenEnabled && (
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground w-24">Start time</Label>
              <Input
                type="time"
                value={leadGenStartTime}
                onChange={e => setLeadGenStartTime(e.target.value)}
                className="w-32 bg-muted border-border text-white text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-muted/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Event Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Financial deadlines", value: notifyFinancial, set: setNotifyFinancial },
            { label: "Wealth milestones", value: notifyMilestones, set: setNotifyMilestones },
            { label: "MREA deliverables", value: notifyDeliverables, set: setNotifyDeliverables },
            { label: "Weekly pulse reminder", value: notifyPulse, set: setNotifyPulse },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">{label}</Label>
              <Switch checked={value} onCheckedChange={set} />
            </div>
          ))}
          {notifyPulse && (
            <div className="flex items-center gap-3 pt-1">
              <Label className="text-sm text-muted-foreground w-28">Pulse reminder time</Label>
              <Input
                type="time"
                value={pulseTime}
                onChange={e => setPulseTime(e.target.value)}
                className="w-32 bg-muted border-border text-white text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Setting */}
      <Card className="bg-muted/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Push Behavior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-foreground/80">Require approval before push</Label>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Review events in queue before they go to Calendar</p>
            </div>
            <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateMutation.isPending}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white">
        Save Settings
      </Button>
    </div>
  );
}
