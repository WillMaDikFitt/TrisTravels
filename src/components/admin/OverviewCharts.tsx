"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/admin/ui";
import { cn, formatINR } from "@/lib/utils";

export type OverviewChartData = {
  bookingTrend: { date: string; label: string; bookings: number; revenue: number }[];
  statusMix: { name: string; value: number; color: string }[];
  enquirySources: { name: string; value: number }[];
  topExperiences: { name: string; bookings: number; revenue: number }[];
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e4dfd4",
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(42,46,31,0.08)",
  fontSize: 12,
};

function ChartCard({
  title,
  hint,
  children,
  footer,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Panel className="flex min-h-[340px] flex-col pb-6">
      <div className="mb-4">
        <h2 className="font-display text-lg text-[#2a2e1f]">{title}</h2>
        {hint ? <p className="mt-1 text-xs text-[#8a917c]">{hint}</p> : null}
      </div>
      <div className={cn("w-full", footer ? "h-48" : "h-56")}>{children}</div>
      {footer ? <div className="mt-4 pb-1">{footer}</div> : null}
    </Panel>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-[#f7f4ee] text-sm text-[#8a917c]">
      {label}
    </div>
  );
}

export function OverviewCharts({ data }: { data: OverviewChartData }) {
  const hasTrend = data.bookingTrend.some((row) => row.bookings > 0 || row.revenue > 0);
  const hasStatus = data.statusMix.some((row) => row.value > 0);
  const hasSources = data.enquirySources.some((row) => row.value > 0);
  const hasExperiences = data.topExperiences.some((row) => row.bookings > 0);

  return (
    <section className="mt-8 space-y-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#6b734f] uppercase">Analytics</p>
        <h2 className="mt-1 font-display text-2xl text-[#2a2e1f]">Performance snapshot</h2>
        <p className="mt-1 text-sm text-[#5c6350]">Last 30 days of bookings, revenue, and enquiry mix.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Bookings & revenue" hint="Daily volume and confirmed guest totals">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.bookingTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a5a28" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4a5a28" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c2643a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c2643a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ece7de" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8a917c", fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8a917c", fontSize: 11 }}
                  width={28}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8a917c", fontSize: 11 }}
                  width={56}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                  }
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => {
                    const amount = typeof value === "number" ? value : Number(value ?? 0);
                    if (name === "revenue") return [formatINR(amount), "Revenue"];
                    return [amount, "Bookings"];
                  }}
                  labelFormatter={(_, payload) => {
                    const point = payload?.[0]?.payload as { date?: string } | undefined;
                    return point?.date
                      ? new Date(`${point.date}T12:00:00`).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "";
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#4a5a28"
                  fill="url(#bookingsFill)"
                  strokeWidth={2.2}
                  name="bookings"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c2643a"
                  fill="url(#revenueFill)"
                  strokeWidth={2}
                  name="revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No booking activity in the last 30 days." />
          )}
        </ChartCard>

        <ChartCard
          title="Booking status mix"
          hint="Share of all live booking records"
          footer={
            hasStatus ? (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {data.statusMix.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-[#5c6350]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                    <span className="capitalize">{entry.name}</span>
                    <span className="font-semibold text-[#2a2e1f]">{entry.value}</span>
                  </div>
                ))}
              </div>
            ) : null
          }
        >
          {hasStatus ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {data.statusMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [value ?? 0, String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No bookings to chart yet." />
          )}
        </ChartCard>

        <ChartCard title="Enquiries by source" hint="Where demand is coming from">
          {hasSources ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.enquirySources} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#ece7de" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8a917c", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8a917c", fontSize: 11 }}
                  width={28}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value ?? 0, "Enquiries"]} />
                <Bar dataKey="value" fill="#4a5a28" radius={[8, 8, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No enquiries in this period." />
          )}
        </ChartCard>

        <ChartCard title="Top experiences" hint="Most booked experiences by count">
          {hasExperiences ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topExperiences}
                layout="vertical"
                margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#ece7de" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8a917c", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#5c6350", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name, item) => {
                    if (name === "bookings") return [value ?? 0, "Bookings"];
                    const revenue = Number(item?.payload?.revenue ?? 0);
                    return [formatINR(revenue), "Revenue"];
                  }}
                />
                <Bar dataKey="bookings" fill="#c2643a" radius={[0, 8, 8, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No experience bookings to rank yet." />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
