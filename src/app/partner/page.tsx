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
        alt="Partner with TRIS"
        compact
        eyebrow="Collaborate"
        title="Partner with us"
        body="From one home to many hearts — together, we thrive. Register as a local partner and grow with community-first travel."
        primaryCta={{ href: "#partner-form", label: "Register now" }}
        secondaryCta={{ href: "/about", label: "Our story" }}
      />

      <section
        id="partner-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-10 px-margin-mobile py-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)] lg:gap-12 md:px-margin-desktop md:py-16"
      >
        <FadeIn>
          <PartnerRegistrationForm onSuccess={() => setSent(true)} />
        </FadeIn>

        <div className="space-y-5 lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-6">
            <p className="label-caps text-accent">Who can register</p>
            <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
              <li>· Homestays & accommodation</li>
              <li>· Drivers & transport</li>
              <li>· Adventure activity providers</li>
              <li>· Local food hosts</li>
              <li>· Handicrafts, products & artisans</li>
              <li>· Cultural experiences & guides</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-6">
            <p className="label-caps text-accent">What happens next</p>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              We review every registration. If there is a fit, we follow up to learn more — this does
              not guarantee bookings.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={media.craft} alt="Local partners" fill className="object-cover" sizes="30vw" />
          </div>
        </div>
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
