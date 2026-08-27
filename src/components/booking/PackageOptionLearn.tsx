"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  PACKAGE_TRANSPORT,
  STAY_STYLES,
  packageTransportMeta,
  stayStyleMeta,
  type PackageTransportId,
  type StayStyleId,
} from "@/data/journey-options";
import { cn } from "@/lib/utils";

export type PackageLearnTab = "stay" | "vehicle" | "terms";

type TermsSub = "general" | "booking" | "transport" | "accommodation" | "policies" | "contact";

const MAIN_TABS: { id: PackageLearnTab; label: string }[] = [
  { id: "stay", label: "Stay type" },
  { id: "vehicle", label: "Car type" },
  { id: "terms", label: "Terms" },
];

const TERMS_SUBS: { id: TermsSub; label: string }[] = [
  { id: "general", label: "General" },
  { id: "booking", label: "Booking & Payments" },
  { id: "transport", label: "Transportation" },
  { id: "accommodation", label: "Accommodation" },
  { id: "policies", label: "Policies" },
  { id: "contact", label: "Contact" },
];

function MainTabs({
  value,
  onChange,
}: {
  value: PackageLearnTab;
  onChange: (tab: PackageLearnTab) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-surface-container p-1">
      {MAIN_TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-[11px] font-bold tracking-[0.08em] uppercase transition",
              active
                ? "bg-cta text-on-cta shadow-sm"
                : "text-on-surface-variant hover:text-primary",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function SubTabs({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition",
              active
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ImageCarousel({ images, label }: { images: string[]; label: string }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    setIndex(0);
  }, [label, images]);

  if (!total) return null;

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + total) % total);
  };

  return (
    <div className="space-y-2.5">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-container">
        <Image
          src={images[index]}
          alt={`${label} reference ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 55vw"
          priority={index === 0}
        />
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-primary-container/75 text-on-primary-container backdrop-blur-sm transition hover:bg-primary-container"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-primary-container/75 text-on-primary-container backdrop-blur-sm transition hover:bg-primary-container"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <p className="absolute right-3 bottom-3 rounded-full bg-primary-container/80 px-2.5 py-1 text-[10px] font-bold tracking-wider text-on-primary-container uppercase backdrop-blur-sm">
              {index + 1} / {total}
            </p>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {images.map((src, i) => (
            <button
              key={`${label}-thumb-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition",
                i === index
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest"
                  : "opacity-65 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StayPanel({ stayId }: { stayId: StayStyleId }) {
  const style = stayStyleMeta(stayId);
  return (
    <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-7">
      <ImageCarousel images={style.images} label={style.label} />
      <div className="space-y-3">
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl text-primary">
            {style.label}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary/80">Best for: {style.bestFor}</p>
        </div>
        <p className="text-sm leading-relaxed text-on-surface-variant">{style.learnIntro}</p>
        <ul className="space-y-1.5 text-sm text-on-surface-variant">
          {style.expect.slice(0, 4).map((item) => (
            <li key={item} className="flex gap-2">
              <Check size={14} className="mt-0.5 shrink-0 text-highlight" />
              {item}
            </li>
          ))}
        </ul>
        <p className="font-[family-name:var(--font-playfair)] text-sm italic text-primary/80">
          “{style.think}”
        </p>
      </div>
    </div>
  );
}

function VehiclePanel({ vehicleId }: { vehicleId: PackageTransportId }) {
  const option = packageTransportMeta(vehicleId);
  return (
    <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-7">
      <ImageCarousel images={option.images} label={option.label} />
      <div className="space-y-3">
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl text-primary">
            {option.label}
            <span className="ml-2 text-sm font-normal text-on-surface-variant">
              · Max {option.maxGuests}
            </span>
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">{option.idealFor}</p>
        </div>
        <p className="text-sm leading-relaxed text-on-surface-variant">{option.summary}</p>
        <dl className="grid gap-x-4 gap-y-2 text-sm text-on-surface-variant sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-primary">Luggage</dt>
            <dd>{option.luggage}</dd>
          </div>
          <div>
            <dt className="font-semibold text-primary">AC</dt>
            <dd>{option.ac}</dd>
          </div>
          {option.windows ? (
            <div className="sm:col-span-2">
              <dt className="font-semibold text-primary">Windows</dt>
              <dd>{option.windows}</dd>
            </div>
          ) : null}
        </dl>
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-primary">Best for:</span> {option.bestFor}
        </p>
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-primary">Note:</span> {option.goodToKnow}
        </p>
        {option.examples ? (
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-primary">Examples:</span> {option.examples}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TermsHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-primary">{children}</h3>
  );
}

function TermsSubHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="mt-4 text-sm font-semibold text-primary">{children}</h4>;
}

function TermsList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-on-surface-variant">
      {items.map((item) => (
        <li key={item.slice(0, 56)} className="flex gap-2">
          <Check size={14} className="mt-1 shrink-0 text-highlight" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StayCategoryCard({
  emoji,
  title,
  body,
  bestFor,
}: {
  emoji: string;
  title: string;
  body: string;
  bestFor: string;
}) {
  return (
    <article className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
      <p className="font-medium text-primary">
        <span className="mr-1.5" aria-hidden>
          {emoji}
        </span>
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{body}</p>
      <p className="mt-2 text-xs font-medium text-primary/85">Best for: {bestFor}</p>
    </article>
  );
}

function TermsPanel({ sub }: { sub: TermsSub }) {
  if (sub === "general") {
    return (
      <div className="space-y-3">
        <TermsHeading>General</TermsHeading>
        <p className="text-sm font-medium text-highlight">
          Effective from June 2025 until further notice
        </p>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          By confirming a package booking with TRIS Travels, you agree to the following Terms &amp;
          Conditions. These terms ensure clarity, transparency, and a smooth experience for all
          parties involved.
        </p>
        <p className="text-xs text-on-surface-variant">
          Full page:{" "}
          <Link
            href="/terms/fixed-departures"
            target="_blank"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Package Tours Terms &amp; Conditions
          </Link>
        </p>
      </div>
    );
  }

  if (sub === "booking") {
    return (
      <div className="space-y-1">
        <TermsHeading>Booking &amp; Payments</TermsHeading>
        <TermsSubHeading>Booking Confirmation</TermsSubHeading>
        <TermsList
          items={[
            "A 30% advance payment is required to confirm your booking.",
            "To ensure smooth processing and secure reservations, the remaining experience and service fees must be cleared at least 25 days prior to the trip's start date. This allows us to finalize all arrangements and provide the best possible service for your travel experience.",
          ]}
        />
        <TermsSubHeading>Cancellation &amp; Refund Policy</TermsSubHeading>
        <p className="mt-2 text-sm text-on-surface-variant">
          To cancel your booking, please email:{" "}
          <a
            href="mailto:trissimai03@gmail.com"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            trissimai03@gmail.com
          </a>
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          Cancellations will be processed as per the schedule below:
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-outline-variant/30">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary-container text-on-primary-container">
              <tr>
                <th className="px-3 py-2.5 font-semibold">When you cancel</th>
                <th className="px-3 py-2.5 font-semibold">Refund</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <tr className="border-t border-outline-variant/25">
                <td className="px-3 py-2.5">25 days or more before arrival</td>
                <td className="px-3 py-2.5 font-medium text-primary">70% of total booking</td>
              </tr>
              <tr className="border-t border-outline-variant/25">
                <td className="px-3 py-2.5">Between 25 and 15 days before arrival</td>
                <td className="px-3 py-2.5 font-medium text-primary">50% of total booking</td>
              </tr>
              <tr className="border-t border-outline-variant/25">
                <td className="px-3 py-2.5">Less than 15 days before arrival</td>
                <td className="px-3 py-2.5 font-medium text-primary">No refund</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (sub === "transport") {
    return (
      <div className="space-y-1">
        <TermsHeading>Transportation &amp; Vehicles</TermsHeading>
        <TermsSubHeading>Vehicle Availability</TermsSubHeading>
        <TermsList
          items={[
            "A vehicle will be provided based on availability at the time of booking.",
            "Last-minute changes may result in an alternative vehicle or potential delays.",
            "Transportation is provided strictly as per the agreed itinerary. Any additional usage or services will incur extra charges.",
            "You may request the driver to stop anywhere along the route, as long as it is within the journey’s designated path. Please note, these stops do not include overnight stays.",
            "Any changes or additions to the services after booking are subject to availability and may involve additional costs.",
          ]}
        />
        <TermsSubHeading>Duration and Timing</TermsSubHeading>
        <TermsList
          items={[
            "The booking is valid for the specific dates and times mentioned.",
            "Extra charges may apply for delays or early pickups.",
            "For the safety of our clients and our driver, the vehicle and driver will be available for a maximum of 10 hours per day. We kindly request you to plan your day accordingly to ensure a comfortable and safe journey for everyone. Extra hours will be chargeable @ Rs. 500 per hour.",
          ]}
        />
        <TermsSubHeading>Driver Conduct</TermsSubHeading>
        <TermsList
          items={[
            "The driver assigned to you will be professional, polite, and knowledgeable. We maintain a zero-tolerance policy towards any inappropriate behavior directed at the driver or damage to the vehicle.",
          ]}
        />
        <TermsSubHeading>Drivers fees, Fuel and Tolls</TermsSubHeading>
        <TermsList
          items={[
            "The driver’s charges, meals, and accommodation are all included in the service fee. No additional payment is required during the trip.",
            "All fuel and toll fees are included unless specified otherwise.",
          ]}
        />
        <TermsSubHeading>Safety</TermsSubHeading>
        <TermsList
          items={[
            "Seat belts must be worn at all times.",
            "Passengers must adhere to the driver’s instructions for safety reasons.",
          ]}
        />
      </div>
    );
  }

  if (sub === "accommodation") {
    return (
      <div className="space-y-4">
        <div>
          <TermsHeading>Accommodation</TermsHeading>
          <TermsSubHeading>Accommodation Requests</TermsSubHeading>
          <TermsList
            items={[
              "Any special accommodation requests (e.g., specific room types, early check-in, late check-out) or added services (e.g., extra beds, upgraded amenities) are subject to availability and will incur additional charges.",
              "Changes to accommodation after booking will also incur additional charges. However, if required we are committed to serving you better and will do our best to arrange alternate accommodation within a similar range and standard, subject to availability.",
            ]}
          />
        </div>
        <div>
          <TermsSubHeading>Accommodation Categories — Guidelines</TermsSubHeading>
          <div className="mt-3 space-y-3">
            <StayCategoryCard
              emoji="👣"
              title="Barefoot Comfort"
              body="Experience the warmth of simple living with our Barefoot Comfort stays — clean, welcoming, and rooted in the local way of life. These are village guesthouses, homestays, camping and accommodations run by the locals that offer the basics with heart. You’ll find peaceful surroundings, local food, attached bathrooms and cultural connection — without compromising on cleanliness or safety."
              bestFor="Solo travelers, young explorers, backpackers, culture-lovers, and anyone seeking a grounded, authentic experience on a modest budget."
            />
            <StayCategoryCard
              emoji="🏡"
              title="Signature Stays"
              body="Signature Stays are thoughtfully selected properties offering a balance of comfort, character, and charm. These include boutique resorts, heritage homes and well-maintained hotels — designed for travelers who appreciate good design, quality service, and a personal touch. Some may include premium amenities, while others offer quiet elegance in natural or cultural settings."
              bestFor="Couples, families, working professionals, small groups, and those who enjoy comfort with a story — not too basic, not overly luxurious."
            />
            <StayCategoryCard
              emoji="🌿"
              title="Offbeat Roots"
              body="Offbeat Roots are soulful stays in nature-connected and lesser-known locations — tucked in forests, hillside villages, or remote countryside homes. These places are unplugged from modern noise and often come without Wi-Fi or phone signal. What they offer instead: homemade food, slow mornings, starlit nights, and real conversations. A perfect invitation to disconnect and truly be present."
              bestFor="Mindful travelers, nature seekers, writers, artists, spiritual travelers, or anyone looking to unplug, reflect, and reconnect with what truly matters."
            />
            <StayCategoryCard
              emoji="🏨"
              title="Luxury Stays"
              body="Luxury Stays are upscale accommodations offering top-notch comfort, premium locations, personalized service, fine dining, and modern amenities. Ideal for those seeking a lavish and relaxing travel experience."
              bestFor="Travellers seeking elevated comfort and a polished stay."
            />
            <StayCategoryCard
              emoji="🔄"
              title="I’m Flexible"
              body="You’re open to any type of accommodation based on availability, value, and location. This option allows us to recommend the best available stay that fits your overall travel style and budget."
              bestFor="Travellers happy for us to mix stay types to suit the route and budget."
            />
          </div>
        </div>
      </div>
    );
  }

  if (sub === "policies") {
    return (
      <div className="space-y-1">
        <TermsHeading>Policies &amp; Conditions</TermsHeading>
        <TermsSubHeading>Passenger Responsibility</TermsSubHeading>
        <TermsList
          items={[
            "Passengers are responsible for their personal belongings during the ride. TRIS Travels will not be held liable for any lost or damaged items.",
          ]}
        />
        <TermsSubHeading>Changes to Itinerary</TermsSubHeading>
        <TermsList
          items={[
            "Any changes to the itinerary must be communicated at least 3 days in advance.",
            "Changes may incur additional charges.",
          ]}
        />
        <TermsSubHeading>Natural Calamities and Force Majeure</TermsSubHeading>
        <TermsList
          items={[
            "TRIS Travels is not liable for delays or cancellations caused by factors outside our control, such as weather, road conditions, accidents, natural calamities (e.g., floods, landslides, storms) or unforeseen circumstances beyond our control.",
            "In case of such events, we will make reasonable efforts to adjust the itinerary, but safety and well-being will always be our priority.",
          ]}
        />
        <TermsSubHeading>Dispute Resolution</TermsSubHeading>
        <TermsList
          items={[
            "In case of any issues, both parties will try to resolve matters amicably. If needed, we will proceed to the appropriate legal forums.",
          ]}
        />
        <TermsSubHeading>Insurance</TermsSubHeading>
        <TermsList
          items={[
            "The taxi booking does not include insurance for passengers or personal belongings.",
            "Passengers are encouraged to have their own travel insurance to cover any unforeseen circumstances.",
          ]}
        />
        <TermsSubHeading>Use of Photos and Content</TermsSubHeading>
        <TermsList
          items={[
            "During the tour, photos and videos may be taken by TRIS Travels for promotional purposes.",
            "Please notify us in advance if you prefer not to be photographed.",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TermsHeading>Contact</TermsHeading>
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
        <p className="font-semibold text-primary">TRIS Travels</p>
        <p className="mt-3">
          Email:{" "}
          <a
            href="mailto:trissimai03@gmail.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            trissimai03@gmail.com
          </a>
        </p>
        <p className="mt-1">
          Phone/WhatsApp:{" "}
          <a
            href="https://wa.me/917005241197"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            +91-7005241197
          </a>
        </p>
        <p className="mt-1">
          Website:{" "}
          <a
            href="https://www.trismeghalaya.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            www.trismeghalaya.com
          </a>
        </p>
      </div>
    </div>
  );
}

export function PackageOptionsModal({
  open,
  onClose,
  initialTab = "stay",
  stayId,
  vehicleId,
  onStayChange,
  onVehicleChange,
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: PackageLearnTab;
  stayId: StayStyleId;
  vehicleId: PackageTransportId;
  onStayChange?: (id: StayStyleId) => void;
  onVehicleChange?: (id: PackageTransportId) => void;
}) {
  const [tab, setTab] = useState<PackageLearnTab>(initialTab);
  const [staySub, setStaySub] = useState<StayStyleId>(stayId);
  const [vehicleSub, setVehicleSub] = useState<PackageTransportId>(vehicleId);
  const [termsSub, setTermsSub] = useState<TermsSub>("general");

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setStaySub(stayId);
    setVehicleSub(vehicleId);
  }, [open, initialTab, stayId, vehicleId]);

  const title =
    tab === "stay" ? "Stay type" : tab === "vehicle" ? "Car type" : "Terms & Conditions";

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-5xl">
      <div className="space-y-4">
        <MainTabs value={tab} onChange={setTab} />

        {tab === "stay" ? (
          <>
            <SubTabs
              options={STAY_STYLES.map((s) => ({ id: s.id, label: s.label.replace(" Stays", "") }))}
              value={staySub}
              onChange={(id) => {
                const next = id as StayStyleId;
                setStaySub(next);
                onStayChange?.(next);
              }}
            />
            <StayPanel stayId={staySub} />
          </>
        ) : null}

        {tab === "vehicle" ? (
          <>
            <SubTabs
              options={PACKAGE_TRANSPORT.map((t) => ({
                id: t.id,
                label: `${t.label} · ${t.maxGuests}`,
              }))}
              value={vehicleSub}
              onChange={(id) => {
                const next = id as PackageTransportId;
                setVehicleSub(next);
                onVehicleChange?.(next);
              }}
            />
            <VehiclePanel vehicleId={vehicleSub} />
          </>
        ) : null}

        {tab === "terms" ? (
          <>
            <SubTabs
              options={TERMS_SUBS}
              value={termsSub}
              onChange={(id) => setTermsSub(id as TermsSub)}
            />
            <TermsPanel sub={termsSub} />
          </>
        ) : null}
      </div>
    </Modal>
  );
}

/** @deprecated Use PackageOptionsModal */
export function TransportLearnContent({ selectedId }: { selectedId: PackageTransportId }) {
  return <VehiclePanel vehicleId={selectedId} />;
}

/** @deprecated Use PackageOptionsModal */
export function StayLearnContent({ selectedId }: { selectedId: StayStyleId }) {
  return <StayPanel stayId={selectedId} />;
}
