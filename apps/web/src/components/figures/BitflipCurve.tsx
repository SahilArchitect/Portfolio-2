'use client';

import { useId, useMemo, useState } from 'react';

import type { BitflipData } from '@/lib/markdown/bitflip';

import styles from './BitflipCurve.module.css';

const W = 640;
const H = 300;
const M = { top: 16, right: 16, bottom: 40, left: 48 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    ticks.push(Number(v.toPrecision(12)));
  }
  return ticks;
}

function fmt(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(Math.abs(value) < 1 ? 3 : 2);
}

/** Value of a series at x: the last point at or before x (step-hold), or null before its first point. */
function valueAt(points: [number, number][], x: number): number | null {
  let found: number | null = null;
  for (const [px, py] of points) {
    if (px <= x) found = py;
    else break;
  }
  return found;
}

/**
 * Accuracy vs. number of flipped bits. Renders only what the uploaded JSON
 * contains; the slider (and pointer hover) pick an x value and read every
 * series at that point. A data table is always available for screen readers
 * and for colours that are hard to tell apart.
 */
export function BitflipCurve({ data, caption }: { data: BitflipData; caption?: string }) {
  const id = useId();
  const series = useMemo(
    () => data.series.map((s) => ({ ...s, points: [...s.points].sort((a, b) => a[0] - b[0]) })),
    [data],
  );
  const xs = useMemo(
    () => [...new Set(series.flatMap((s) => s.points.map((p) => p[0])))].sort((a, b) => a - b),
    [series],
  );
  const [index, setIndex] = useState(0);
  const selectedX = xs[Math.min(index, xs.length - 1)] ?? 0;

  const xMin = xs[0] ?? 0;
  const xMax = xs.at(-1) ?? 1;
  const ys = series.flatMap((s) => s.points.map((p) => p[1]));
  const yLo = Math.min(...ys);
  const yHi = Math.max(...ys);
  const pad = (yHi - yLo) * 0.08 || 0.05;
  const yMin = yLo >= 0 && yLo - pad < 0 ? 0 : yLo - pad;
  const yMax = yHi + pad;

  const sx = (x: number) => M.left + (xMax === xMin ? PW / 2 : ((x - xMin) / (xMax - xMin)) * PW);
  const sy = (y: number) => M.top + PH - ((y - yMin) / (yMax - yMin)) * PH;
  const xTicks = niceTicks(xMin, xMax);
  const yTicks = niceTicks(yMin, yMax, 4);

  function pickFromPointer(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = xMin + ((event.clientX - rect.left) / rect.width) * (xMax - xMin);
    let best = 0;
    xs.forEach((candidate, i) => {
      if (Math.abs(candidate - x) < Math.abs((xs[best] ?? 0) - x)) best = i;
    });
    setIndex(best);
  }

  const xLabel = data.xLabel ?? 'Flipped bits';
  const yLabel = data.yLabel ?? 'Accuracy';
  const readings = series.map((s, i) => ({
    name: s.name,
    slot: i + 1,
    value: valueAt(s.points, selectedX),
  }));

  return (
    <figure className={styles.root}>
      {data.title && <p className={styles.title}>{data.title}</p>}
      {series.length > 1 && (
        <ul className={styles.legend} aria-label="Series">
          {series.map((s, i) => (
            <li key={s.name}>
              <span
                className={styles.swatch}
                style={{ background: `var(--series-${i + 1})` }}
                aria-hidden="true"
              />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        role="img"
        aria-labelledby={`${id}-desc`}
      >
        <desc id={`${id}-desc`}>
          {`Line chart of ${yLabel.toLowerCase()} against ${xLabel.toLowerCase()} for ${series.map((s) => s.name).join(', ')}. The data table below lists every value.`}
        </desc>
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={M.left} x2={W - M.right} y1={sy(t)} y2={sy(t)} className={styles.grid} />
            <text
              x={M.left - 8}
              y={sy(t)}
              className={styles.tick}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {fmt(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text
            key={`x${t}`}
            x={sx(t)}
            y={H - M.bottom + 18}
            className={styles.tick}
            textAnchor="middle"
          >
            {fmt(t)}
          </text>
        ))}
        <line
          x1={M.left}
          x2={W - M.right}
          y1={M.top + PH}
          y2={M.top + PH}
          className={styles.axis}
        />
        <text x={M.left + PW / 2} y={H - 4} className={styles.axisLabel} textAnchor="middle">
          {xLabel}
        </text>
        <text
          transform={`translate(12 ${M.top + PH / 2}) rotate(-90)`}
          className={styles.axisLabel}
          textAnchor="middle"
        >
          {yLabel}
        </text>

        <line
          x1={sx(selectedX)}
          x2={sx(selectedX)}
          y1={M.top}
          y2={M.top + PH}
          className={styles.crosshair}
        />

        {series.map((s, i) => (
          <polyline
            key={s.name}
            points={s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
            fill="none"
            stroke={`var(--series-${i + 1})`}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {readings.map((r) =>
          r.value === null ? null : (
            <circle
              key={r.name}
              cx={sx(selectedX)}
              cy={sy(r.value)}
              r={4.5}
              fill={`var(--series-${r.slot})`}
              className={styles.marker}
            />
          ),
        )}
        <rect
          x={M.left}
          y={M.top}
          width={PW}
          height={PH}
          fill="transparent"
          onPointerMove={pickFromPointer}
          onPointerDown={pickFromPointer}
        />
      </svg>

      <div className={styles.controls}>
        <label htmlFor={`${id}-slider`} className="meta">
          {xLabel}: <strong className={styles.value}>{fmt(selectedX)}</strong>
        </label>
        <input
          id={`${id}-slider`}
          type="range"
          min={0}
          max={Math.max(0, xs.length - 1)}
          step={1}
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          aria-valuetext={`${fmt(selectedX)} ${xLabel.toLowerCase()}`}
          className={styles.slider}
        />
        <output htmlFor={`${id}-slider`} className={`meta ${styles.readings}`} aria-live="polite">
          {readings.map((r) => (
            <span key={r.name}>
              <span
                className={styles.swatch}
                style={{ background: `var(--series-${r.slot})` }}
                aria-hidden="true"
              />
              {r.name}: {r.value === null ? '—' : fmt(r.value)}
            </span>
          ))}
        </output>
      </div>

      <details className={styles.table}>
        <summary className="meta">Data table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{xLabel}</th>
              {series.map((s) => (
                <th key={s.name} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {xs.map((x) => (
              <tr key={x}>
                <th scope="row">{fmt(x)}</th>
                {series.map((s) => {
                  const point = s.points.find((p) => p[0] === x);
                  return <td key={s.name}>{point ? fmt(point[1]) : ''}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
