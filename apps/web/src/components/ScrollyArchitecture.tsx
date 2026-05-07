import { cssVarNames } from '@engine-room/ui/tokens';

import { MetricsWidget } from './MetricsWidget';
import type { ProjectView, PublicMetricsView } from '@/lib/view-models';

const tokenVar = {
  bg: `var(${cssVarNames.bg})`,
  fg: `var(${cssVarNames.fg})`,
  accent: `var(${cssVarNames.accent})`,
  borderStrong: `var(${cssVarNames.borderStrong})`,
};

const STAGES = [
  { label: 'Ingress', copy: 'Requests enter through a typed API boundary with explicit failure states.' },
  { label: 'Retrieve', copy: 'The system narrows context through indexed project and writing corpora.' },
  { label: 'Generate', copy: 'The LLM gateway enforces citation discipline, timeout budgets, and spend tracking.' },
  { label: 'Observe', copy: 'Redacted traces and public aggregates expose behavior without leaking payloads.' },
] as const;

type ScrollyArchitectureProps = {
  project: ProjectView;
  metrics: PublicMetricsView;
};

export function ScrollyArchitecture({ project, metrics }: ScrollyArchitectureProps) {
  return (
    <section className="border-y border-border bg-bg">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">System path</p>
          <h2 className="mt-3 font-display text-display-md font-medium text-fg">Architecture walkthrough</h2>
          <p className="mt-4 text-body text-fg-muted">
            The build is shaped around clear handoffs, citation discipline, and observable failure states.
          </p>

          <div className="mt-8 grid gap-3">
            {STAGES.map((item, index) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-bg-elev p-4"
              >
                <p className="font-mono text-mono-sm text-fg">{String(index + 1).padStart(2, '0')} / {item.label}</p>
                <p className="mt-2 text-body-sm text-fg-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-bg-elev p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">{project.title} architecture</p>
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
                SVG assembly
              </span>
            </div>
            <svg viewBox="0 0 720 420" role="img" aria-label={`${project.title} architecture diagram`} className="h-auto w-full">
              <DiagramNode x="40" y="150" label="Web" />
              <DiagramNode x="220" y="70" label="API" />
              <DiagramNode x="420" y="150" label="RAG" />
              <DiagramNode x="600" y="70" label="LLM" />
              <DiagramNode x="220" y="260" label="Postgres" />
              <DiagramNode x="420" y="260" label="Redis" />
              <path d="M150 185 C190 185 190 120 220 120" stroke={tokenVar.accent} strokeWidth="2" fill="none" />
              <path d="M330 120 C370 120 370 185 420 185" stroke={tokenVar.accent} strokeWidth="2" fill="none" />
              <path d="M530 185 C570 185 570 120 600 120" stroke={tokenVar.accent} strokeWidth="2" fill="none" />
              <path d="M270 150 V260" stroke={tokenVar.borderStrong} strokeWidth="1.5" fill="none" />
              <path d="M470 210 V260" stroke={tokenVar.borderStrong} strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <MetricsWidget initialData={metrics} compact />
        </div>
      </div>
    </section>
  );
}

function DiagramNode({ x, y, label }: { x: string; y: string; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="110" height="70" rx="12" fill={tokenVar.bg} stroke={tokenVar.borderStrong} />
      <text x="55" y="42" textAnchor="middle" fill={tokenVar.fg} fontSize="16" fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}
