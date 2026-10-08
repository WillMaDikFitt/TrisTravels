import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChevronRight,
  Gift,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  activeCraftProducts,
  DEFAULT_CRAFT_MAKERS,
  DEFAULT_CRAFT_PRODUCTS,
  makerCategoryLabels,
  normalizeCraftsPage,
  resolveCraftMakers,
} from "@/data/artisans";
import { getSettings } from "@/lib/data/repo";
import { FadeIn } from "@/components/motion/Motion";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { PhotoPlaceholder } from "@/components/listings/PhotoPlaceholder";
import { MakerGallery } from "@/components/listings/MakerGallery";

type Props = { params: Promise<{ slug: string }> };

/** Pick up Studio → Crafts edits without waiting for a full redeploy. */
export const revalidate = 60;

async function loadMaker(slug: string) {
  const settings = await getSettings().catch(() => null);
  const products = activeCraftProducts(
    settings?.craftProducts,
    DEFAULT_CRAFT_PRODUCTS,
  );
  return {
    maker: resolveCraftMakers(settings?.craftMakers, products).find(
      (m) => m.slug === slug,
    ),
    copy: normalizeCraftsPage(settings?.craftsPage),
  };
}

export function generateStaticParams() {
  return DEFAULT_CRAFT_MAKERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { maker } = await loadMaker((await params).slug);
  return { title: maker ? `${maker.name} · Makers` : "Maker" };
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

const specialIcons = [ShieldCheck, Leaf, Users, Gift];

type Channel = {
  icon: ReactNode;
  tone: string;
  label: string;
  value: string;
  href?: string;
};

export default async function MakerPage({ params }: Props) {
  const { maker, copy } = await loadMaker((await params).slug);
  if (!maker) notFound();

  const pieceNames = maker.crafts.map((c) => c.name).join(", ");
  // Main photo first, then the Studio gallery (no limit). Without a gallery, the maker's craft photos fill in.
  const photos = [
    ...new Set(
      [
        maker.image,
        ...maker.gallery,
        ...(maker.gallery.length ? [] : maker.crafts.map((c) => c.image)),
      ].filter(Boolean),
    ),
  ];

  const enquireHref = `/contact?${new URLSearchParams({
    craft: maker.crafts[0]?.slug ?? maker.slug,
    craftName: pieceNames ? `${maker.name} — ${pieceNames}` : maker.name,
  })}`;

  const whatsappDigits = maker.whatsapp.replace(/\D/g, "");
  const instagramHandle = maker.instagram
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/$/, "");

  const channels = (
    [
      whatsappDigits && {
        icon: <WhatsAppIcon size={20} />,
        tone: "bg-[#25d366] text-white",
        label: "WhatsApp",
        value: maker.whatsapp,
        href: `https://wa.me/${whatsappDigits}?${new URLSearchParams({
          text: `Hi, I'd like to know more about ${maker.name}${pieceNames ? ` (${pieceNames})` : ""}.`,
        })}`,
      },
      maker.phone && {
        icon: <Phone size={18} />,
        tone: "bg-secondary text-on-secondary",
        label: "Call",
        value: maker.phone,
        href: `tel:${maker.phone.replace(/[^\d+]/g, "")}`,
      },
      instagramHandle && {
        icon: <InstagramIcon />,
        tone: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white",
        label: "Instagram",
        value: `@${instagramHandle}`,
        href: `https://www.instagram.com/${instagramHandle}`,
      },
      maker.email && {
        icon: <Mail size={18} />,
        tone: "bg-terracotta text-on-terracotta",
        label: "Email",
        value: maker.email,
        href: `mailto:${maker.email}`,
      },
      maker.location && {
        icon: <MapPin size={18} />,
        tone: "bg-terracotta/15 text-terracotta",
        label: "Location",
        value: maker.location,
      },
    ] as (Channel | "")[]
  ).filter((c): c is Channel => !!c);

  return (
    <div className="bg-background pt-header">
      <MakerGallery
        images={photos}
        alt={maker.name}
        badge={makerCategoryLabels[maker.category]}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-on-surface-variant"
        >
          <Link href="/" className="hover:text-secondary hover:underline">
            Home
          </Link>
          <ChevronRight size={12} aria-hidden />
          <Link
            href="/artisans"
            className="hover:text-secondary hover:underline"
          >
            Local Products
          </Link>
          <ChevronRight size={12} aria-hidden />
          <Link
            href="/artisans#hub"
            className="hover:text-secondary hover:underline"
          >
            {copy.heroTitle}
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-secondary">{maker.name}</span>
        </nav>
      </MakerGallery>

      {/* Contact bar */}
      <section className="border-b border-outline-variant/25 bg-surface-container-low">
        <div className="mx-auto flex max-w-container-max flex-col gap-3 px-margin-mobile py-4 md:px-margin-desktop lg:flex-row lg:items-center">
          <div
            className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
            style={{ "--cols": channels.length } as React.CSSProperties}
          >
            {channels.map((c) => {
              const body = (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${c.tone}`}
                  >
                    {c.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-secondary">
                      {c.label}
                    </span>
                    <span className="block text-[11px] leading-snug [overflow-wrap:anywhere] text-on-surface-variant">
                      {c.value}
                    </span>
                  </span>
                </>
              );
              const cls =
                "flex items-center gap-2.5 rounded-xl bg-surface-container-lowest px-3 py-3 shadow-sm transition";
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={`${cls} hover:-translate-y-0.5`}
                >
                  {body}
                </a>
              ) : (
                <div key={c.label} className={cls}>
                  {body}
                </div>
              );
            })}
          </div>
          <div className="lg:shrink-0">
            <Link
              href={enquireHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-on-primary transition hover:opacity-90"
            >
              Connect with the Maker
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
        <p className="mx-auto max-w-container-max px-margin-mobile pb-3 text-center text-xs text-on-surface-variant md:px-margin-desktop lg:-mt-1 lg:text-right">
          {copy.connectCaption}
        </p>
      </section>

      {/* Story */}
      <div className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        <FadeIn>
          <p className="text-xs font-bold tracking-[0.25em] text-terracotta uppercase">
            TRIS Curated
          </p>
          <h1 className="mt-2 font-serif text-4xl text-secondary md:text-6xl">
            {maker.name}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-on-surface">
            <MapPin size={16} className="text-secondary" aria-hidden />
            {maker.location}
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-on-surface-variant md:text-lg">
            {maker.story}
          </p>
        </FadeIn>

        {maker.about && (
          <ProfileSection title="About the Maker">{maker.about}</ProfileSection>
        )}
        {maker.journey && (
          <ProfileSection title="The Maker’s Journey">
            {maker.journey}
          </ProfileSection>
        )}

        <div className="mt-8 grid gap-10 border-t border-outline-variant/40 pt-8 md:grid-cols-2 md:gap-0">
          <FadeIn className="md:border-r md:border-outline-variant/40 md:pr-10">
            <h2 className="font-serif text-3xl text-secondary">
              What You’ll Find
            </h2>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              {maker.find}
            </p>
            {maker.crafts.length > 0 && (
              <a
                href="#pieces"
                className="mt-6 inline-flex items-center gap-3 rounded-full border border-terracotta px-7 py-3 text-secondary transition hover:bg-terracotta/10"
              >
                Explore Available Pieces
                <ArrowRight size={16} aria-hidden />
              </a>
            )}
          </FadeIn>
          <FadeIn className="md:pl-10">
            <h2 className="font-serif text-3xl text-secondary">
              What Makes Their Work Special?
            </h2>
            <ul className="mt-5 space-y-4">
              {copy.specialPoints.map((label, i) => {
                const Icon = specialIcons[i] ?? Gift;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-on-surface-variant"
                  >
                    <Icon
                      size={24}
                      strokeWidth={1.5}
                      className="shrink-0 text-secondary"
                      aria-hidden
                    />
                    {label}
                  </li>
                );
              })}
            </ul>
          </FadeIn>
        </div>

        {/* Pieces */}
        {maker.crafts.length > 0 && (
          <section id="pieces" className="scroll-mt-header mt-14">
            <h2 className="font-serif text-3xl text-secondary">
              Available Pieces
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {maker.crafts.map((c) => (
                <article
                  key={c.slug}
                  className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest"
                >
                  <div className="relative aspect-[4/3]">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="(max-width:640px) 100vw, 33vw"
                      />
                    ) : (
                      <PhotoPlaceholder />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl text-secondary">
                      {c.name}
                    </h3>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {c.blurb}
                    </p>
                    <Link
                      href={`/contact?${new URLSearchParams({ craft: c.slug, craftName: c.name })}`}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-primary uppercase hover:underline"
                    >
                      Ask about this piece
                      <ArrowRight size={13} aria-hidden />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FadeIn className="mt-8 border-t border-outline-variant/40 pt-8">
      <h2 className="font-serif text-3xl text-secondary">{title}</h2>
      <span className="mt-2 block h-0.5 w-8 bg-terracotta" aria-hidden />
      <p className="mt-4 max-w-4xl leading-relaxed text-on-surface-variant">
        {children}
      </p>
    </FadeIn>
  );
}
