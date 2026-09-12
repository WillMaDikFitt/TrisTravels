export type SharedFaqItem = {
  id: string;
  q: string;
  a: string;
  active?: boolean;
  sortOrder?: number;
};

export type SharedFaqKind = "experiences" | "curatedJourneys" | "home";

/** Homepage "Questions before you go" — seeded with the copy that used to be hard-coded. */
export const DEFAULT_HOME_FAQS: SharedFaqItem[] = [
  {
    id: "home-difference",
    q: "What’s the difference between an experience and a journey?",
    a: "An experience is a few hours to a full day — a trek, a kitchen, a village stay. A journey is longer: a curated package we shape with you, or a small-group departure with a set date.",
    active: true,
    sortOrder: 1,
  },
  {
    id: "home-book-ahead",
    q: "How far ahead should I book?",
    a: "For day experiences, booking about ten days ahead lets us confirm hosts and keep the day unhurried. Closer dates are still welcome — send a request and we’ll see what’s possible.",
    active: true,
    sortOrder: 2,
  },
  {
    id: "home-who",
    q: "Who will I travel with?",
    a: "Khasi hosts and local guides. Days are community-led — you eat, walk, and rest with people who live here, not a generic tour group.",
    active: true,
    sortOrder: 3,
  },
  {
    id: "home-custom",
    q: "Can you plan something just for us?",
    a: "Yes. Send a brief through Craft my journey — dates, pace, who you’re travelling with — and we’ll shape the week around you.",
    active: true,
    sortOrder: 4,
  },
  {
    id: "home-included",
    q: "What’s usually included?",
    a: "Each page lists what’s in and what’s extra. Day experiences typically cover the host or guide, the activity, and often a meal. Journeys add stays and transfers as described.",
    active: true,
    sortOrder: 5,
  },
  {
    id: "home-pay",
    q: "How do I pay?",
    a: "Day experiences can be booked online. Journeys and last-minute requests are confirmed by our team first, then we share how to pay.",
    active: true,
    sortOrder: 6,
  },
];

export const DEFAULT_EXPERIENCE_FAQS: SharedFaqItem[] = [
  {
    id: "exp-book-ahead",
    q: "How far ahead should I book an experience?",
    a: "Booking about ten days ahead lets us confirm hosts and keep the day unhurried. Closer dates are still welcome — send a request and we’ll see what’s possible.",
    active: true,
    sortOrder: 1,
  },
  {
    id: "exp-included",
    q: "What’s usually included?",
    a: "Each experience page lists what’s in and what’s extra. Day experiences typically cover the host or guide, the activity, and often a meal. Transport is shown separately when offered.",
    active: true,
    sortOrder: 2,
  },
  {
    id: "exp-transport",
    q: "Do I need to book TRIS transport?",
    a: "Some experiences require TRIS transport; others let you arrange your own or book with us. You’ll see the option clearly when you book.",
    active: true,
    sortOrder: 3,
  },
  {
    id: "exp-children",
    q: "Can children join?",
    a: "Many experiences welcome children within the listed age and group limits. Child rates and suitability notes appear on the booking form and experience page.",
    active: true,
    sortOrder: 4,
  },
  {
    id: "exp-payment",
    q: "How do I pay?",
    a: "Dates far enough ahead can usually be booked and paid online. Closer dates may need a quick confirmation from our team first — we’ll share how to pay once availability is clear.",
    active: true,
    sortOrder: 5,
  },
  {
    id: "exp-who",
    q: "Who will I travel with?",
    a: "Khasi hosts and local guides. Days are community-led — you eat, walk, and rest with people who live here, not a generic tour group.",
    active: true,
    sortOrder: 6,
  },
];

export const DEFAULT_CURATED_JOURNEY_FAQS: SharedFaqItem[] = [
  {
    id: "cj-what",
    q: "What is a curated journey?",
    a: "A curated journey is a multi-day trip we shape around your dates, pace, and group — with stays, transport, and experiences planned together rather than sold as a fixed departure.",
    active: true,
    sortOrder: 1,
  },
  {
    id: "cj-book",
    q: "How does booking and payment work?",
    a: "When dates allow online booking, you choose stay style, vehicles, and rooms, then pay a 50% advance. The balance is due before travel. Closer dates may need an enquiry first.",
    active: true,
    sortOrder: 2,
  },
  {
    id: "cj-stay",
    q: "What stay styles can I choose?",
    a: "You can pick from the stay styles shown when you book (for example barefoot, signature, or offbeat). Learn more on the booking flow explains what each style feels like.",
    active: true,
    sortOrder: 3,
  },
  {
    id: "cj-transport",
    q: "Is transport included?",
    a: "Package pricing includes the vehicles you select for the journey days. You choose the vehicle type and how many you need for your group size.",
    active: true,
    sortOrder: 4,
  },
  {
    id: "cj-itinerary",
    q: "When do I get the full day-wise itinerary?",
    a: "Once you confirm interest or book, we share the detailed day-wise plan, stay suggestions, and packing tips tailored to your route.",
    active: true,
    sortOrder: 5,
  },
  {
    id: "cj-customise",
    q: "Can you customise the journey?",
    a: "Yes. Use Craft my journey or write to us with dates, who you’re travelling with, and what matters most — we’ll shape the week around you.",
    active: true,
    sortOrder: 6,
  },
];

export function blankFaqItem(index = 0): SharedFaqItem {
  return {
    id: `faq-${Date.now().toString(36)}-${index}`,
    q: "",
    a: "",
    active: true,
    sortOrder: index + 1,
  };
}

export function normalizeSharedFaqs(
  rows: SharedFaqItem[] | null | undefined,
  fallback: SharedFaqItem[],
): SharedFaqItem[] {
  if (!rows?.length) {
    return fallback.map((item) => ({ ...item }));
  }
  return rows
    .map((row, index) => ({
      id: String(row.id || `faq-${index}`),
      q: String(row.q || "").trim(),
      a: String(row.a || "").trim(),
      active: row.active !== false,
      sortOrder: Number.isFinite(row.sortOrder) ? Number(row.sortOrder) : index + 1,
    }))
    .filter((row) => row.q && row.a)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function activeSharedFaqs(
  rows: SharedFaqItem[] | null | undefined,
  fallback: SharedFaqItem[],
): SharedFaqItem[] {
  return normalizeSharedFaqs(rows, fallback).filter((row) => row.active !== false);
}
