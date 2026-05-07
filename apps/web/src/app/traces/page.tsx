import type { Metadata } from 'next';

import { MetricsWidget } from '@/components/MetricsWidget';
import { Section } from '@/components/Section';
import { TraceViewer } from '@/components/TraceViewer';
import { fetchMetrics } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Traces',
  description: 'Public redacted telemetry and trace viewer.',
};

export default async function TracesPage() {
  const metrics = await fetchMetrics();

  return (
    <main id="content">
      <Section
        eyebrow="Traces"
        title="Telemetry that proves the system is alive."
        intro="The public view is read-only and redacted: enough latency and span structure to inspect behavior, no prompts, payloads, emails, tokens, or secrets."
      >
        <div className="space-y-8">
          <MetricsWidget initialData={metrics} />
          <TraceViewer initialData={metrics} />
        </div>
      </Section>
    </main>
  );
}
