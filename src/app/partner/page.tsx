"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import {
  FormCard,
  FormInput,
  FormSelect,
  FormSuccess,
  FormTextarea,
} from "@/components/ui/Form";
import { media } from "@/data/media";

export default function PartnerPage() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-background">
        <FormSuccess
          title="Application received"
          body="Thank you. Submission is not onboarding — the TRIS team reviews applications and may follow up for evaluation."
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
        title="Partner with Us"
        body="Guides, homestays, transport providers, experience hosts, and artisans — express interest in working with TRIS."
        primaryCta={{ href: "#partner-form", label: "Apply now" }}
        secondaryCta={{ href: "/about", label: "Our values" }}
      />

      <BreathSection
        size="sm"
        eyebrow="Join the network"
        title="Grow with community-first travel"
        body="Submission does not mean approval. Shortlisted partners may go through further evaluation before onboarding."
      />

      <section
        id="partner-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-10 px-margin-mobile pb-16 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:px-margin-desktop md:pb-24"
      >
        <FadeIn>
          <FormCard
            title="Partner application"
            subtitle="Tell us who you are and how you’d like to collaborate."
          >
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormInput
                  label="Full name / organisation"
                  name="name"
                  required
                  autoComplete="organization"
                />
                <FormSelect
                  label="Partner type"
                  name="type"
                  required
                  placeholder="Select type"
                  options={[
                    "Guide",
                    "Homestay",
                    "Transport",
                    "Experience provider",
                    "Artisan",
                    "Other",
                  ]}
                />
                <FormInput
                  label="Phone / WhatsApp"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                />
                <FormInput label="Email" name="email" type="email" autoComplete="email" />
                <FormInput
                  label="Location / village"
                  name="location"
                  placeholder="e.g. Mawlynnong, East Khasi Hills"
                  className="md:col-span-2"
                />
              </div>
              <FormTextarea
                label="About your service"
                name="about"
                required
                rows={5}
                placeholder="What you offer, who you serve, and why you’d like to partner with TRIS…"
              />
              <FormTextarea
                label="Experience / credentials (optional)"
                name="credentials"
                rows={3}
                placeholder="Years of experience, licences, references…"
              />
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs text-on-surface-variant">
                  Applying starts a conversation — not a contract.
                </p>
                <Button type="submit" size="lg">
                  Submit application
                </Button>
              </div>
            </form>
          </FormCard>
        </FadeIn>

        <div className="space-y-5 md:sticky md:top-36 md:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src={media.craft}
              alt="Local partners"
              fill
              className="object-cover"
              sizes="40vw"
            />
          </div>
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5">
            <p className="label-caps text-accent">Who we partner with</p>
            <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
              <li>· Local guides and forest hosts</li>
              <li>· Homestays and community stays</li>
              <li>· Trusted transport providers</li>
              <li>· Artisans and experience makers</li>
            </ul>
          </div>
        </div>
      </section>

      <FullBleedParallax
        src={media.heroForest}
        alt="Meghalaya forest"
        title="Community is the heartbeat of TRIS"
        cta={{ href: "/about", label: "Our story" }}
        height="md"
        align="center"
        overlay="soft"
      />
    </div>
  );
}
