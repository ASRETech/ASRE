import { Link } from 'wouter';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border bg-card p-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm text-muted-foreground">Login flow will be finalized during the platform migration.</p>
        <Link href="/onboarding" className="inline-flex mt-5 rounded-lg border px-4 py-2 text-sm font-medium">
          Continue to onboarding
        </Link>
      </div>
    </div>
  );
}
