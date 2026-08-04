'use client';

import { useState } from 'react';
import { parseDateKeyLocal } from '@/src/lib/dateUtils';

/**
 * A dependency-free SVG bar chart. Deliberately not using a charting
 * library here — this is a small, fixed shape of data (30 bars, one
 * metric), and hand-rolling the SVG keeps the bundle lighter than pulling
 * in recharts/chart.js for a single chart.
 */
export default function DailyChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 700;
  const height = 180;
  const barGap = 3;
  const barWidth = width / data.length - barGap;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Appointments per day, last 30 days">
        {data.map((d, i) => {
          const barHeight = (d.count / max) * (height - 24);
          const x = i * (barWidth + barGap);
          const y = height - barHeight - 20;
          const isHover = hoverIndex === i;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                className={isHover ? 'fill-brand-blue' : 'fill-brand-teal/70'}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          );
        })}
        <line x1="0" y1={height - 20} x2={width} y2={height - 20} stroke="#e2e8f0" strokeWidth="1" />
      </svg>

      <div className="mt-1 flex justify-between text-[10px] text-brand-dark/40">
        <span>
          {parseDateKeyLocal(data[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span>
          {parseDateKeyLocal(data[data.length - 1]?.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full rounded-lg bg-brand-dark px-3 py-1.5 text-xs text-white shadow-soft"
          style={{ left: `${((hoverIndex + 0.5) / data.length) * 100}%` }}
        >
          <span className="font-semibold">{data[hoverIndex].count}</span> on{' '}
          {parseDateKeyLocal(data[hoverIndex].date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )}
    </div>
  );
}
