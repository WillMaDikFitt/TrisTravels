import Link from "next/link";
import { listBookings } from "@/lib/actions/bookings";
import { listEnquiries } from "@/lib/actions/enquiries";
import { listExperiences, listJourneys } from "@/lib/data/repo";
import { Badge, PageHeader, Panel, StatCard, bookingTone } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";
import { nextOpenDeparture, seatsLeft } from "@/lib/journey-seats";

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

export default async function AdminDashboard() {
  const [bookings, enquiries, experiences, journeys] = await Promise.all([
    listBookings(),
    listEnquiries(),
    listExperiences(),
    listJourneys(),
  ]);

  const needsConfirm = bookings.filter((b) => b.status === "requested" || b.status === "hold");
  const newEnquiries = enquiries.filter((e) => e.status === "new" && e.source !== "story");
  const newStories = enquiries.filter((e) => e.status === "new" && e.source === "story");

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

  return (
    <div>
      <PageHeader
        eyebrow="Today"
        title="What needs you"
        description="Confirm bookings, clear the inbox, and keep an eye on this week’s departures."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Needs confirm" value={needsConfirm.length} hint="Holds & booking requests" />
        <StatCard label="New enquiries" value={newEnquiries.length} hint="Craft, journey, contact, partner" />
        <StatCard label="New guest stories" value={newStories.length} hint="Awaiting review" />
        <StatCard
          label="Departures this month"
          value={departuresThisMonth.length}
          hint={`${experiences.length} live experiences`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">Action required</h2>
            <div className="flex gap-3 text-xs font-semibold tracking-wider text-[#4a5a28] uppercase">
              <Link href="/admin/bookings">Bookings</Link>
              <Link href="/admin/enquiries">Inbox</Link>
            </div>
          </div>
          <ul className="space-y-3">
            {actionItems.map((item) => (
              <li key={item.key} className="border-b border-[#f0ebe3] pb-3 last:border-0">
                <Link href={item.href} className="block hover:opacity-80">
                  <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                    {item.kind}
                  </p>
                  <p className="mt-0.5 font-medium">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#5c6350]">{item.meta}</p>
                </Link>
              </li>
            ))}
            {!actionItems.length && (
              <li className="text-sm text-[#8a917c]">You’re clear — nothing waiting.</li>
            )}
          </ul>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">This week</h2>
            <Link
              href="/admin/journeys"
              className="text-xs font-semibold tracking-wider text-[#4a5a28] uppercase"
            >
              Journeys
            </Link>
          </div>
          <ul className="space-y-3">
            {thisWeekBookings.map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-3 border-b border-[#f0ebe3] pb-3">
                <div>
                  <p className="font-medium">{b.experienceName}</p>
                  <p className="text-sm text-[#5c6350]">
                    {b.date} · {b.slot} · {b.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <Badge tone={bookingTone(b.status)}>{b.status}</Badge>
                  <p className="mt-1 text-xs text-[#8a917c]">{formatINR(b.customerTotal)}</p>
                </div>
              </li>
            ))}
            {thisWeekDepartures.map(({ journey, dep }) => (
              <li
                key={`${journey.slug}-${dep.date}`}
                className="border-b border-[#f0ebe3] pb-3 last:border-0"
              >
                <Link href={`/admin/journeys/${journey.slug}`} className="block hover:opacity-80">
                  <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                    Small group
                  </p>
                  <p className="mt-0.5 font-medium">{journey.name}</p>
                  <p className="mt-1 text-sm text-[#5c6350]">
                    {dep.date} · {seatsLeft(dep)} seats left
                  </p>
                </Link>
              </li>
            ))}
            {!thisWeekBookings.length && !thisWeekDepartures.length && (
              <li className="text-sm text-[#8a917c]">Nothing scheduled this week yet.</li>
            )}
          </ul>

          {departuresThisMonth.length > 0 && (
            <div className="mt-6 border-t border-[#f0ebe3] pt-4">
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                Next open departure
              </p>
              {journeys
                .map((j) => ({ j, next: nextOpenDeparture(j.departureSeats) }))
                .filter((x) => x.next)
                .slice(0, 3)
                .map(({ j, next }) => (
                  <p key={j.slug} className="mt-2 text-sm text-[#5c6350]">
                    <Link href={`/admin/journeys/${j.slug}`} className="font-medium text-[#2a2e1f]">
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
