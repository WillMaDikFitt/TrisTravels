"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";
import {
  FormCard,
  FormInput,
  FormSelect,
  FormSuccess,
  FormTextarea,
} from "@/components/ui/Form";
import { media } from "@/data/media";
import { submitEnquiry } from "@/lib/actions/enquiries";

export default function PartnerPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      <section className="border-b border-outline-variant/20 bg-surface pt-header">
        <div className="mx-auto grid max-w-container-max md:grid-cols-2">
          <div className="flex flex-col justify-center px-margin-mobile py-12 md:px-margin-desktop md:py-16">
            <p className="label-caps text-accent">Collaborate</p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">Partner with us</h1>
            <p className="mt-4 max-w-md text-on-surface-variant">
              Guides, homestays, transport, experience hosts, and artisans — grow with community-first travel.
            </p>
            <Link
              href="#partner-form"
              className="mt-8 inline-flex h-10 items-center rounded-full bg-primary px-6 text-xs font-bold tracking-[0.12em] text-on-primary uppercase transition hover:bg-primary/90"
            >
              Apply now
            </Link>
          </div>
          <div className="relative min-h-[280px] md:min-h-0">
            <Image
              src={media.valueCommunity}
              alt="Partner with TRIS"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/25" />
          </div>
        </div>
      </section>

      <section
        id="partner-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-10 px-margin-mobile py-12 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-margin-desktop md:py-16"
      >
        <FadeIn>
          <FormCard
            title="Partner application"
            subtitle="Short form — we review every submission."
          >
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setBusy(true);
                setError("");
                try {
                  const res = await submitEnquiry({
                    source: "partner",
                    name: String(fd.get("name") || ""),
                    email: String(fd.get("email") || ""),
                    phone: String(fd.get("phone") || ""),
                    message: String(fd.get("about") || ""),
                    payload: {
                      type: String(fd.get("type") || ""),
                      location: String(fd.get("location") || ""),
                      credentials: String(fd.get("credentials") || ""),
                    },
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
                <FormInput label="Email" name="email" type="email" required autoComplete="email" />
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
                rows={4}
                placeholder="What you offer and why you’d like to partner with TRIS…"
              />
              <FormTextarea
                label="Experience / credentials (optional)"
                name="credentials"
                rows={2}
                placeholder="Years of experience, licences, references…"
              />
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs text-on-surface-variant">
                  Applying starts a conversation — not a contract.
                </p>
                {error && <p className="text-sm text-primary">{error}</p>}
                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? "Sending…" : "Submit application"}
                </Button>
              </div>
            </form>
          </FormCard>
        </FadeIn>

        <div className="space-y-5 md:sticky md:top-36 md:self-start">
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-6">
            <p className="label-caps text-accent">Who we partner with</p>
            <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
              <li>· Local guides and forest hosts</li>
              <li>· Homestays and community stays</li>
              <li>· Trusted transport providers</li>
              <li>· Artisans and experience makers</li>
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={media.craft} alt="Local partners" fill className="object-cover" sizes="40vw" />
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
