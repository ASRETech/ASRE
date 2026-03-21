/**
 * ActionEngine.tsx — Phase 9
 * Google Calendar integration + event queue management
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ActionEngineHero } from "@/components/calendar/ActionEngineHero";
import { EventQueue } from "@/components/calendar/EventQueue";
import { CalendarSettings } from "@/components/calendar/CalendarSettings";
import { LeadGenCalculator } from "@/components/calendar/LeadGenCalculator";

export default function ActionEngine() {
  const [location] = useLocation();
  const { data: authUrlData } = trpc.calendar.getAuthUrl.useQuery();

  // Handle OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cal") === "connected") {
      toast.success("Google Calendar connected successfully!");
      window.history.replaceState({}, "", "/action-engine");
    } else if (params.get("cal") === "error") {
      toast.error("Failed to connect Google Calendar. Please try again.");
      window.history.replaceState({}, "", "/action-engine");
    }
  }, []);

  const handleConnect = () => {
    if (authUrlData?.url) {
      window.location.href = authUrlData.url;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <ActionEngineHero onConnect={handleConnect} />

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700 w-full md:w-auto">
          <TabsTrigger value="queue" className="data-[state=active]:bg-slate-700 flex-1 md:flex-none">
            Event Queue
          </TabsTrigger>
          <TabsTrigger value="calculator" className="data-[state=active]:bg-slate-700 flex-1 md:flex-none">
            Lead Gen Calc
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 flex-1 md:flex-none">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <EventQueue />
        </TabsContent>

        <TabsContent value="calculator" className="mt-4">
          <LeadGenCalculator />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <CalendarSettings onConnect={handleConnect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
