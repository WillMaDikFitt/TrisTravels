export function seatsLeft(d: { seats: number; held: number; booked: number }) {
  return Math.max(0, d.seats - d.held - d.booked);
}

export function nextOpenDeparture(
  seats?: { date: string; seats: number; held: number; booked: number; note?: string }[],
) {
  if (!seats?.length) return null;
  const today = new Date().toISOString().slice(0, 10);
  return (
    [...seats]
      .filter((d) => d.date >= today && seatsLeft(d) > 0)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  );
}

export function parseDepartureSeats(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [date, seats, held, booked, ...noteParts] = line.split("|").map((s) => s.trim());
      return {
        date: date || "",
        seats: Number(seats) || 0,
        held: Number(held) || 0,
        booked: Number(booked) || 0,
        note: noteParts.join("|").trim() || undefined,
      };
    })
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
}

export function formatDepartureSeats(
  seats?: { date: string; seats: number; held: number; booked: number; note?: string }[],
) {
  return (seats ?? [])
    .map((d) => [d.date, d.seats, d.held, d.booked, d.note ?? ""].join("|"))
    .join("\n");
}
