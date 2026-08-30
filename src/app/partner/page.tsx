"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero } from "@/components/motion/FullBleedParallax";
import { CtaBand } from "@/components/ui/CtaBand";
import { FormSuccess } from "@/components/ui/Form";
import { PartnerRegistrationForm } from "@/components/enquiries/PartnerRegistrationForm";
import { media } from "@/data/media";

export default function PartnerPage() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-background">
        <FormSuccess
          title="Registration received"
          body="Thank you. This form is for registration only and does not guarantee bookings. The TRIS team will review your details and may follow up."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/about">Our story</Button>
            <Button href="/" variant="ghost">
              Home
            </Button>
          </div>
        </FormSuccess>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHero
        src={media.valueCommunity}
        alt="A village in the Meghalaya hills"
        compact
        eyebrow="Collaborate"
        title="Partner with us"
        body="From one home to many hearts — together, we thrive. Register as a local partner and grow with community-first travel."
        primaryCta={{ href: "#partner-form", label: "Register now" }}
        secondaryCta={{ href: "/about", label: "Our story" }}
      />

      <section
        id="partner-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-8 px-margin-mobile py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:items-start lg:gap-10 md:px-margin-desktop md:py-12"
      >
        <FadeIn>
          <PartnerRegistrationForm onSuccess={() => setSent(true)} />
        </FadeIn>

        <aside className="space-y-3 lg:sticky lg:top-[calc(var(--header-offset)+1rem)] lg:self-start">
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low px-5 py-4">
            <p className="label-caps text-accent">Who can register</p>
            <ul className="mt-3 space-y-1.5 text-[0.8125rem] leading-snug text-on-surface-variant">
              <li>· Homestays & accommodation</li>
              <li>· Drivers & transport</li>
              <li>· Adventure activity providers</li>
              <li>· Local food hosts</li>
              <li>· Handicrafts, products & artisans</li>
              <li>· Cultural experiences & guides</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low px-5 py-4">
            <p className="label-caps text-accent">What happens next</p>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-on-surface-variant">
              We review every registration. If there is a fit, we follow up to learn more — this does
              not guarantee bookings.
            </p>
          </div>
          <div className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl lg:block">
            <Image src={media.craft} alt="Local partners" fill className="object-cover" sizes="28vw" />
          </div>
        </aside>
      </section>

      <CtaBand
        eyebrow="The TRIS way"
        title="Community is the heartbeat"
        body="Read how TRIS began — and why hosts, guides, and travellers grow together."
        primary={{ href: "/about", label: "Our story" }}
        secondary={{ href: "/experiences", label: "See experiences" }}
      />
    </div>
  );
}
