"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/utils";

/**
 * Chart conventions: single series per chart (the title names it, no legend),
 * volt marks on the charcoal surface, 2px lines, 4px rounded bar ends,
 * recessive grid, hover tooltip, plus a visually-hidden table for screen readers.
 */
const VOLT = "#c8ff2e";
const GRID = "rgba(255,255,255,0.06)";
const AXIS = { fill: "#9a9aa1", fontSize: 11, fontFamily: "var(--font-jetbrains)" };

type Point = Record<string, string | number>;

function ChartTooltip({ active, payload, label, unit, labelFormat }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string; labelFormat?: (l: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-white/10 bg-ink/95 px-3 py-2 shadow-xl">
      <p className="text-sm font-bold text-bone">
        {payload[0].value}
        {unit && <span className="ml-0.5 font-normal text-smoke">{unit}</span>}
      </p>
      <p className="font-mono text-[0.7rem] uppercase tracking-wider text-smoke">{labelFormat ? labelFormat(String(label)) : label}</p>
    </div>
  );
}

function DataTable({ data, x, y, caption, unit }: { data: Point[]; x: string; y: string; caption: string; unit?: string }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{x}</th>
          <th scope="col">{y}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td>{String(d[x])}</td>
            <td>
              {String(d[y])}
              {unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const shortDate = (d: string) => formatDate(d, { day: "numeric", month: "short" });

export function WeightSparkline({ data }: { data: { date: string; weight: number }[] }) {
  return (
    <div className="mt-4 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VOLT} stopOpacity={0.25} />
              <stop offset="100%" stopColor={VOLT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          <XAxis dataKey="date" hide />
          <Tooltip content={<ChartTooltip unit=" kg" labelFormat={shortDate} />} cursor={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Area type="monotone" dataKey="weight" stroke={VOLT} strokeWidth={2} fill="url(#spark)" activeDot={{ r: 4, fill: VOLT, stroke: "#0c0c0d", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
      <DataTable data={data} x="date" y="weight" unit=" kg" caption="Body weight by date" />
    </div>
  );
}

export function TrendChart({ data, dataKey, unit, label, height = 240 }: { data: Point[]; dataKey: string; unit?: string; label: string; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} allowDecimals={false} width={44} />
          <Tooltip content={<ChartTooltip unit={unit} labelFormat={shortDate} />} cursor={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Line type="monotone" dataKey={dataKey} stroke={VOLT} strokeWidth={2} dot={{ r: 3, fill: VOLT, stroke: "#0c0c0d", strokeWidth: 2 }} activeDot={{ r: 5, fill: VOLT, stroke: "#0c0c0d", strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
      <DataTable data={data} x="date" y={dataKey} unit={unit} caption={label} />
    </div>
  );
}

const FORMATS = { thousands: (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)) };

export function BarsChart({ data, x, y, unit, label, height = 240, format }: { data: Point[]; x: string; y: string; unit?: string; label: string; height?: number; format?: keyof typeof FORMATS }) {
  const valueFormat = format ? FORMATS[format] : undefined;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap={4}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={x} tick={AXIS} axisLine={false} tickLine={false} minTickGap={8} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={valueFormat} allowDecimals={false} />
          <Tooltip
            content={({ active, payload, label: l }) => (
              <ChartTooltip active={active} payload={payload?.map((p) => ({ value: valueFormat ? (valueFormat(Number(p.value)) as unknown as number) : Number(p.value) }))} label={String(l)} unit={unit} />
            )}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey={y} fill={VOLT} radius={[4, 4, 0, 0]} maxBarSize={36} activeBar={{ fill: "#d9ff6b" }} />
        </BarChart>
      </ResponsiveContainer>
      <DataTable data={data} x={x} y={y} unit={unit} caption={label} />
    </div>
  );
}
