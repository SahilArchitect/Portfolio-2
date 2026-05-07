'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const axis = 'var(--fg-muted)';
const grid = 'var(--border)';
const accent = 'var(--accent)';
const success = 'var(--success)';
const warning = 'var(--warning)';
const danger = 'var(--danger)';
const bg = 'var(--bg-elev)';
const fg = 'var(--fg)';

const tooltipStyle = {
  background: bg,
  border: '1px solid var(--border-strong)',
  color: fg,
  borderRadius: '8px',
};

export function SpendLineChart({ data }: { data: Array<{ date: string; cost_usd: number; calls: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="date" stroke={axis} tickLine={false} axisLine={false} />
          <YAxis stroke={axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border-strong)' }} />
          <Line type="monotone" dataKey="cost_usd" name="Cost" stroke={accent} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="calls" name="Calls" stroke={success} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EndpointBarChart({ data }: { data: Array<{ endpoint: string; cost_usd: number; tokens: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 16 }}>
          <CartesianGrid stroke={grid} horizontal={false} />
          <XAxis type="number" stroke={axis} tickLine={false} axisLine={false} />
          <YAxis dataKey="endpoint" type="category" stroke={axis} tickLine={false} axisLine={false} width={96} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent-muted)' }} />
          <Bar dataKey="cost_usd" name="Cost" fill={accent} radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TokenHistogram({ data }: { data: Array<{ bucket: string; calls: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="bucket" stroke={axis} tickLine={false} axisLine={false} />
          <YAxis stroke={axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent-muted)' }} />
          <Bar dataKey="calls" name="Calls" fill={warning} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PageViewsChart({ data }: { data: Array<{ path: string; views: number; visitors: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="path" stroke={axis} tickLine={false} axisLine={false} />
          <YAxis stroke={axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent-muted)' }} />
          <Bar dataKey="views" name="Views" fill={accent} radius={[4, 4, 0, 0]} />
          <Bar dataKey="visitors" name="Visitors" fill={success} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelChart({ data }: { data: Array<{ step: string; count: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 16 }}>
          <CartesianGrid stroke={grid} horizontal={false} />
          <XAxis type="number" stroke={axis} tickLine={false} axisLine={false} />
          <YAxis dataKey="step" type="category" stroke={axis} tickLine={false} axisLine={false} width={72} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent-muted)' }} />
          <Bar dataKey="count" name="Count" fill={danger} radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
