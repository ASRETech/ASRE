/**
 * CertificationInterest — ASRE Coach Certification Application
 *
 * Standalone page accessible from /settings/certification-interest
 * Also surfaced in Settings page as a card.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, ExternalLink } from 'lucide-react';

const BENEFITS = [
  'Exclusive access to ASRE coaching frameworks and playbooks',
  'Certification badge for your profile and marketing materials',
  'Priority access to new ASRE tools and features',
  'Community of certified ASRE coaches across KW regions',
  'Revenue share opportunities through referral coaching',
];

export default function CertificationInterest() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.2)' }}
        >
          <BookOpen className="w-5 h-5" style={{ color: '#DC143C' }} />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">ASRE Coach Certification</h1>
          <p className="text-sm text-muted-foreground">Exclusive program — limited cohort enrollment</p>
        </div>
      </div>

      {/* Main CTA Card */}
      <Card className="border-[#DC143C]/20">
        <CardHeader>
          <CardTitle className="text-lg">Interested in Becoming an ASRE Certified Coach?</CardTitle>
          <CardDescription>
            Apply to learn more about certification requirements, the next cohort schedule, and what it means to
            carry the ASRE certification as a KW Productivity Coach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This program is hosted outside of ASRE to keep the platform focused and lightweight. Certified coaches
            gain access to exclusive frameworks, playbooks, and a growing network of ASRE operators across the
            KW ecosystem.
          </p>

          {/* Benefits list */}
          <ul className="space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <Button asChild className="w-full sm:w-auto" style={{ background: '#DC143C' }}>
            <a
              href="https://form.jotform.com/PLACEHOLDER"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              Apply for More Information
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>

          <p className="text-xs text-muted-foreground">
            Applications are reviewed on a rolling basis. You will be contacted within 5–7 business days.
          </p>
        </CardContent>
      </Card>

      {/* What to expect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Step 1 — Application</p>
            <p>Submit the interest form. Tell us about your coaching experience and goals.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Step 2 — Discovery Call</p>
            <p>A 30-minute call to align on fit, timeline, and expectations.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Step 3 — Cohort Enrollment</p>
            <p>Join the next available cohort and begin your certification journey.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Step 4 — Certification</p>
            <p>Complete the program, earn your badge, and join the ASRE coach network.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
