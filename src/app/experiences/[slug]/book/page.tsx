import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { experiences } from "@/data/experiences";
import { findExperience } from "@/lib/data/repo";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BreathSection } from "@/components/ui/BreathSection";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exp = await findExperience(slug);
  return { title: exp ? `Book · ${exp.name}` : "Book" };
}

export default async function BookExperiencePage({ params }: Props) {
  const { slug } = await params;
  const exp = await findExperience(slug);
  if (!exp) notFound();

  return (
    <div className="bg-background">
      <div className="relative min-h-[calc(280px+var(--header-offset))] overflow-hidden pt-header md:min-h-[calc(36vh+var(--header-offset))]">
        <Image
          src={exp.image}
          alt={exp.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-margin-mobile pb-8 pt-8 md:px-margin-desktop">
            <div className="mx-auto max-w-container-max">
              <p className="label-caps text-white/75">Booking</p>
              <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">{exp.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <BreathSection
        size="sm"
        title="Complete your reservation"
        body="Demo flow — select a slot, enter details, review, and simulate Razorpay payment."
      />

      <div className="mx-auto max-w-container-max px-margin-mobile pb-16 md:px-margin-desktop md:pb-24">
        <Suspense fallback={<p className="text-on-surface-variant">Loading booking…</p>}>
          <BookingFlow experience={exp} />
        </Suspense>
      </div>
    </div>
  );
}
