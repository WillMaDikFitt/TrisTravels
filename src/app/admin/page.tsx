import Link from "next/link";
import { listBookings } from "@/lib/actions/bookings";
import { listEnquiries } from "@/lib/actions/enquiries";
import { listExperiences, listJourneys } from "@/lib/data/repo";
import { seedStudioDemo } from "@/lib/actions/studio-demo";
import { OverviewCharts, type OverviewChartData } from "@/components/admin/OverviewCharts";
import { Badge, PageHeader, Panel, StatCard, bookingTone } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";
import { nextOpenDeparture, seatsLeft } from "@/lib/journey-seats";

export const dynamic = "force-dynamic";

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function endOfWeekISO() {
  const start = new Date(startOfWeekISO());
  start.setDate(start.getDate() + 6);
  return start.toISOString().slice(0, 10);
}

function thisMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildOverviewCharts(
  bookings: Awaited<ReturnType<typeof listBookings>>,
  enquiries: Awaited<ReturnType<typeof listEnquiries>>,
): OverviewChartData {
  const start = daysAgoISO(29);
  const trendMap = new Map<string, { bookings: number; revenue: number }>();
  for (let i = 29; i >= 0; i--) {
    const date = daysAgoISO(i);
    trendMap.set(date, { bookings: 0, revenue: 0 });
  }

  for (const booking of bookings) {
    const day = (booking.createdAt || booking.date || "").slice(0, 10);
    if (!day || day < start) continue;
    const row = trendMap.get(day);
    if (!row) continue;
    row.bookings += 1;
    if (booking.status === "confirmed") row.revenue += booking.customerTotal || 0;
  }

  const bookingTrend = [...trendMap.entries()].map(([date, row]) => ({
    date,
    label: new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    bookings: row.bookings,
    revenue: row.revenue,
  }));

  const statusColors: Record<string, string> = {
    confirmed: "#364037",
    requested: "#c96a3d",
    hold: "#d4a017",
    expired: "#b45353",
    cancelled: "#4a5a50",
  };
  const statusCounts = new Map<string, number>();
  for (const booking of bookings) {
    statusCounts.set(booking.status, (statusCounts.get(booking.status) ?? 0) + 1);
  }
  const statusMix = [...statusCounts.entries()].map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] ?? "#4a5a50",
  }));

  const sourceLabels: Record<string, string> = {
    "craft-my-journey": "Craft",
    journey: "Journey",
    contact: "Contact",
    partner: "Partner",
    story: "Stories",
  };
  const sourceCounts = new Map<string, number>();
  for (const enquiry of enquiries) {
    const key = sourceLabels[enquiry.source] ?? enquiry.source;
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const enquirySources = [...sourceCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const experienceMap = new Map<string, { bookings: number; revenue: number }>();
  for (const booking of bookings) {
    const current = experienceMap.get(booking.experienceName) ?? { bookings: 0, revenue: 0 };
    current.bookings += 1;
    if (booking.status === "confirmed") current.revenue += booking.customerTotal || 0;
    experienceMap.set(booking.experienceName, current);
  }
  const topExperiences = [...experienceMap.entries()]
    .map(([name, row]) => ({
      name: name.length > 22 ? `${name.slice(0, 20)}…` : name,
      bookings: row.bookings,
      revenue: row.revenue,
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  return { bookingTrend, statusMix, enquirySources, topExperiences };
}

export default async function AdminDashboard() {
  let bookings: Awaited<ReturnType<typeof listBookings>> = [];
  let enquiries: Awaited<ReturnType<typeof listEnquiries>> = [];
  let experiences: Awaited<ReturnType<typeof listExperiences>> = [];
  let journeys: Awaited<ReturnType<typeof listJourneys>> = [];

  try {
    [bookings, enquiries, experiences, journeys] = await Promise.all([
      listBookings(),
      listEnquiries(),
      listExperiences(),
      listJourneys(),
    ]);
  } catch (err) {
    console.error("Admin overview load failed:", err);
  }

  if (!bookings.length && !enquiries.length) {
    try {
      await seedStudioDemo();
      [bookings, enquiries] = await Promise.all([listBookings(), listEnquiries()]);
    } catch (err) {
      console.error("Admin overview demo seed failed:", err);
    }
  }

  const needsConfirm = bookings.filter((b) => b.status === "requested" || b.status === "hold");
  const newEnquiries = enquiries.filter((e) => e.status === "new" && e.source !== "story");
  const newStories = enquiries.filter((e) => e.status === "new" && e.source === "story");
  const chartData = buildOverviewCharts(bookings, enquiries);

  const month = thisMonthKey();
  const departuresThisMonth = journeys
    .filter((j) => j.type === "small-group")
    .flatMap((j) =>
      (j.departureSeats ?? [])
        .filter((d) => d.date.startsWith(month))
        .map((d) => ({ journey: j, dep: d })),
    )
    .sort((a, b) => a.dep.date.localeCompare(b.dep.date));

  const weekStart = startOfWeekISO();
  const weekEnd = endOfWeekISO();
  const thisWeekBookings = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "requested" || b.status === "hold") &&
      b.date >= weekStart &&
      b.date <= weekEnd,
  );
  const thisWeekDepartures = journeys
    .filter((j) => j.type === "small-group")
    .flatMap((j) =>
      (j.departureSeats ?? [])
        .filter((d) => d.date >= weekStart && d.date <= weekEnd)
        .map((d) => ({ journey: j, dep: d })),
    );

  const actionItems = [
    ...needsConfirm.slice(0, 8).map((b) => ({
      key: b.id,
      href: "/admin/bookings",
      kind: "Booking",
      title: b.experienceName,
      meta: `${b.date} · ${b.customerName} · ${b.status}`,
    })),
    ...newEnquiries.slice(0, 6).map((e) => ({
      key: e.id,
      href: "/admin/enquiries",
      kind: e.source.replace(/-/g, " "),
      title: e.name,
      meta: e.message.slice(0, 80),
    })),
    ...newStories.slice(0, 4).map((e) => ({
      key: e.id,
      href: "/admin/story-submissions",
      kind: "Guest story",
      title: typeof e.payload?.title === "string" ? e.payload.title : e.name,
      meta: e.message.slice(0, 80),
    })),
  ].slice(0, 12);

  const confirmedRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.customerTotal || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Admin dashboard"
        description="Confirm bookings, clear the inbox, and keep an eye on this week’s departures."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Needs confirm" value={needsConfirm.length} hint="Holds & booking requests" />
        <StatCard label="New enquiries" value={newEnquiries.length} hint="Craft, journey, contact, partner" />
        <StatCard label="New guest stories" value={newStories.length} hint="Awaiting review" />
        <StatCard
          label="Confirmed revenue"
          value={formatINR(confirmedRevenue)}
          hint={`${departuresThisMonth.length} departures this month · ${experiences.length} experiences`}
        />
      </div>

      <OverviewCharts data={chartData} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">Action required</h2>
            <div className="flex gap-3 text-xs font-semibold tracking-wider text-[#364037] uppercase">
              <Link href="/admin/bookings">Bookings</Link>
              <Link href="/admin/enquiries">Inbox</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item) => (
                  <tr key={item.key} className="border-t border-[#dde1d0]">
                    <td className="py-2.5 pr-3 text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                      {item.kind}
                    </td>
                    <td className="py-2.5 pr-3 font-medium">
                      <Link href={item.href} className="hover:underline">
                        {item.title}
                      </Link>
                    </td>
                    <td className="max-w-[14rem] py-2.5 text-[#4a5a50]">
                      <p className="line-clamp-2">{item.meta}</p>
                    </td>
                  </tr>
                ))}
                {!actionItems.length && (
                  <tr>
                    <td colSpan={3} className="py-4 text-[#4a5a50]">
                      You’re clear — nothing waiting.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">This week</h2>
            <Link
              href="/admin/journeys"
              className="text-xs font-semibold tracking-wider text-[#364037] uppercase"
            >
              Journeys
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">When</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {thisWeekBookings.map((b) => (
                  <tr key={b.id} className="border-t border-[#dde1d0]">
                    <td className="py-2.5 pr-3 text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                      Booking
                    </td>
                    <td className="py-2.5 pr-3 font-medium">{b.experienceName}</td>
                    <td className="py-2.5 pr-3 text-[#4a5a50]">
                      {b.date}
                      <span className="mt-0.5 block text-xs text-[#4a5a50]">
                        {b.slot} · {b.customerName}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={bookingTone(b.status)}>{b.status}</Badge>
                    </td>
                    <td className="py-2.5 text-right text-[#4a5a50]">{formatINR(b.customerTotal)}</td>
                  </tr>
                ))}
                {thisWeekDepartures.map(({ journey, dep }) => (
                  <tr key={`${journey.slug}-${dep.date}`} className="border-t border-[#dde1d0]">
                    <td className="py-2.5 pr-3 text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                      Fixed
                    </td>
                    <td className="py-2.5 pr-3 font-medium">
                      <Link href={`/admin/journeys/${journey.slug}`} className="hover:underline">
                        {journey.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-[#4a5a50]">{dep.date}</td>
                    <td className="py-2.5 pr-3 text-[#4a5a50]">{seatsLeft(dep)} seats left</td>
                    <td className="py-2.5 text-right text-[#4a5a50]">—</td>
                  </tr>
                ))}
                {!thisWeekBookings.length && !thisWeekDepartures.length && (
                  <tr>
                    <td colSpan={5} className="py-4 text-[#4a5a50]">
                      Nothing scheduled this week yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {departuresThisMonth.length > 0 && (
            <div className="mt-6 border-t border-[#dde1d0] pt-4">
              <p className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                Next open departure
              </p>
              {journeys
                .map((j) => ({ j, next: nextOpenDeparture(j.departureSeats) }))
                .filter((x) => x.next)
                .slice(0, 3)
                .map(({ j, next }) => (
                  <p key={j.slug} className="mt-2 text-sm text-[#4a5a50]">
                    <Link href={`/admin/journeys/${j.slug}`} className="font-medium text-[#26352b]">
                      {j.name}
                    </Link>
                    {" · "}
                    {next!.date} · {seatsLeft(next!)} left
                  </p>
                ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
