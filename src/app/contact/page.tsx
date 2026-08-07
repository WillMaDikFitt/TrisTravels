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
  FormSuccess,
  FormTextarea,
} from "@/components/ui/Form";
import { media } from "@/data/media";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-background">
        <FormSuccess
          title="Message received"
          body="Thanks for reaching out. In production this lands in the TRIS inbox — we’ll reply within one working day."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/experiences">Explore experiences</Button>
            <Button href="/" variant="ghost">
              Back home
            </Button>
          </div>
        </FormSuccess>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHero
        src={media.peaks}
        alt="Contact TRIS"
        compact
        eyebrow="Contact"
        title="We're here when you need us"
        body="Questions before you book? Browse online first — or send a note and we’ll help you plan."
        primaryCta={{ href: "#contact-form", label: "Send a message" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Craft a journey" }}
      />

      <BreathSection
        size="sm"
        eyebrow="Get in touch"
        title="Say hello"
        body="Use the form for planning notes. Prefer a quick chat? WhatsApp works for short questions."
      />

      <section
        id="contact-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-10 px-margin-mobile pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-margin-desktop lg:pb-24"
      >
        <FadeIn className="space-y-6">
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl">
            <Image
              src={media.aboutPortrait}
              alt="TRIS Travels"
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-display text-2xl text-white">
              Based in Meghalaya · Serving travellers worldwide
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                icon: Mail,
                label: "Email",
                value: "hello@trismeghalaya.com",
                href: "mailto:hello@trismeghalaya.com",
              },
              {
                icon: MessageCircle,
                label: "WhatsApp",
                value: "Message us for quick queries",
                href: "/contact",
              },
              {
                icon: Phone,
                label: "Phone",
                value: "Shared on confirmation",
                href: undefined,
              },
              {
                icon: MapPin,
                label: "Based in",
                value: "Shillong · Meghalaya, India",
                href: undefined,
              },
            ].map(({ icon: Icon, label, value, href }) => {
              const inner = (
                <>
                  <Icon className="mt-0.5 shrink-0 text-accent" size={18} />
                  <div>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                    <p className="mt-0.5 font-medium text-primary">{value}</p>
                  </div>
                </>
              );
              const className =
                "flex gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 transition hover:border-accent/40";
              return href && href !== "/contact" ? (
                <a key={label} href={href} className={className}>
                  {inner}
                </a>
              ) : (
                <div key={label} className={className}>
                  {inner}
                </div>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn>
          <FormCard
            title="Send a message"
            subtitle="Tell us what you need — booking help, trip ideas, or partnership questions."
          >
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormInput label="Full name" name="name" required autoComplete="name" />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <FormInput
                label="Phone / WhatsApp"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 …"
              />
              <FormInput
                label="Subject"
                name="subject"
                placeholder="e.g. Help with Root Trails booking"
              />
              <FormTextarea
                label="How can we help?"
                name="message"
                required
                rows={6}
                placeholder="Dates, group size, questions…"
              />
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-on-surface-variant">
                  We typically reply within 1 working day.
                </p>
                <Button type="submit" size="lg">
                  Send message
                </Button>
              </div>
            </form>
          </FormCard>
        </FadeIn>
      </section>

      <FullBleedParallax
        src={media.ride}
        alt="Meghalaya journey"
        title="Or start planning online"
        body="Browse experiences and journeys — book or enquire without the back-and-forth."
        cta={{ href: "/experiences", label: "Explore experiences" }}
        height="md"
        align="center"
        overlay="soft"
      />
    </div>
  );
}
