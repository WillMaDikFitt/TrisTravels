"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero } from "@/components/motion/FullBleedParallax";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  FormCard,
  FormInput,
  FormSuccess,
  FormTextarea,
} from "@/components/ui/Form";
import { media } from "@/data/media";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { submitEnquiry } from "@/lib/actions/enquiries";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <div className="bg-background">
        <FormSuccess
          title="Message received"
          body="Thanks for reaching out. We’ll reply within one working day."
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
        body="Questions before you book? Send a note — or leave your number and we'll WhatsApp back."
        primaryCta={{ href: "#contact-form", label: "Send a message" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Craft a journey" }}
      />

      <section
        id="contact-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-10 px-margin-mobile py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 md:px-margin-desktop md:py-16"
      >
        <FadeIn className="space-y-4">
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
              value: "Leave your number — we’ll ping you back",
            },
            {
              icon: Phone,
              label: "Phone",
              value: "Shared on confirmation",
            },
            {
              icon: MapPin,
              label: "Based in",
              value: "Shillong · Meghalaya, India",
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
            return href ? (
              <a key={label} href={href} className={className}>
                {inner}
              </a>
            ) : (
              <div key={label} className={className}>
                {inner}
              </div>
            );
          })}
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src={media.aboutPortrait}
              alt="TRIS Travels"
              fill
              className="object-cover"
              sizes="40vw"
            />
          </div>
        </FadeIn>

        <FadeIn>
          <FormCard title="Send a message" subtitle="We typically reply within one working day.">
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setBusy(true);
                setError("");
                try {
                  const res = await submitEnquiry({
                    source: "contact",
                    name: String(fd.get("name") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    message: String(fd.get("message") || ""),
                    payload: { subject: String(fd.get("subject") || "") },
                  });
                  if (!res.ok) setError(res.error);
                  else setSent(true);
                } catch {
                  setError("Could not send. Try again.");
                } finally {
                  setBusy(false);
                }
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
                placeholder="e.g. Help with a booking"
              />
              <FormTextarea
                label="How can we help?"
                name="message"
                required
                rows={5}
                placeholder="Dates, group size, questions…"
              />
              {error && <p className="text-sm text-primary">{error}</p>}
              <Button type="submit" size="lg" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
              </Button>
            </form>
          </FormCard>
        </FadeIn>
      </section>

      <CtaBand
        eyebrow="Or start online"
        title="Browse without the back-and-forth"
        body="Experiences book in a few steps. Journeys start with an enquiry."
        primary={{ href: "/experiences", label: "Explore experiences" }}
        secondary={{ href: "/journeys", label: "See journeys" }}
      />
    </div>
  );
}
