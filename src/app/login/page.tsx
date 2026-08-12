"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { FormCard, FormInput } from "@/components/ui/Form";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { useAuth } from "@/components/auth/AuthProvider";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";

function safeNext(raw: string | null) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

function GoogleButton({
  disabled,
  busy,
  onClick,
}: {
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/35 bg-white px-4 text-sm font-semibold text-[#3c4043] shadow-sm transition",
        "hover:bg-[#f8f9fa] hover:shadow disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <GoogleIcon className="h-5 w-5 shrink-0" />
      Continue with Google
    </button>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const dest = safeNext(search.get("next"));
  const { signIn, signInGoogle, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      router.push(dest);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-background pt-header">
      <div className="mx-auto grid min-h-[calc(100vh-var(--header-offset))] max-w-container-max lg:grid-cols-2">
        <div className="relative hidden min-h-[420px] lg:block">
          <Image
            src={media.heroMist}
            alt="Meghalaya mist and hills"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="label-caps text-accent">Your TRIS account</p>
            <p className="mt-3 font-display text-3xl leading-snug">
              Save wishlists, track bookings, and pick up enquiries.
            </p>
          </div>
        </div>

        <div className="flex items-center px-margin-mobile py-14 md:px-margin-desktop md:py-20">
          <div className="mx-auto w-full max-w-md">
            <FormCard title="Log in" subtitle="Welcome back.">
              {!configured && (
                <p className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-secondary">
                  Accounts aren&apos;t available right now. Please try again later.
                </p>
              )}

              <GoogleButton
                disabled={!configured}
                busy={busy}
                onClick={() => run(() => signInGoogle())}
              />

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-outline-variant/30" />
                <span className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
                  or email
                </span>
                <div className="h-px flex-1 bg-outline-variant/30" />
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => signIn(email, password));
                }}
              >
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                />
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="current-password"
                />
                {error && <p className="text-sm text-primary">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={busy || !configured}>
                  {busy ? "Signing in…" : "Log in"}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-on-surface-variant">
                New here?{" "}
                <Link
                  href={dest !== "/account" ? `/signup?next=${encodeURIComponent(dest)}` : "/signup"}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </FormCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="pt-header p-16 text-on-surface-variant">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
