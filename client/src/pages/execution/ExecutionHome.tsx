export default function ExecutionHome() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Execution HQ</h1>
      <p className="text-muted-foreground">Your daily operating system for revenue-producing activity.</p>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="border p-4 rounded">Active Leads</div>
        <div className="border p-4 rounded">Follow-Ups Due</div>
        <div className="border p-4 rounded">Appointments</div>
        <div className="border p-4 rounded">Revenue Pace</div>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-medium">Do This Next</h2>
        <p className="text-sm text-muted-foreground">Action Engine recommendations will appear here.</p>
      </div>
    </div>
  );
}
