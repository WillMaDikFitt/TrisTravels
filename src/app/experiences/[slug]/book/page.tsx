import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { experiences } from "@/data/experiences";
import { findExperience } from "@/lib/data/repo";
import { BookingFlow } from "@/components/booking/BookingFlow";

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
      <div className="relative min-h-[calc(300px+var(--header-offset))] overflow-hidden pt-header md:min-h-[calc(340px+var(--header-offset))]">
        <Image
          src={exp.image}
          alt={exp.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/25" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-margin-mobile pb-16 pt-8 md:px-margin-desktop md:pb-20">
            <div className="mx-auto max-w-container-max">
              <p className="label-caps text-white/75">Booking</p>
              <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">{exp.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                Choose your date, travellers, and transport. Review everything before confirming.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-8 max-w-container-max px-margin-mobile pb-16 md:-mt-10 md:px-margin-desktop md:pb-24">
        <Suspense fallback={<p className="text-on-surface-variant">Loading booking…</p>}>
          <BookingFlow experience={exp} />
        </Suspense>
      </div>
    </div>
  );
}
