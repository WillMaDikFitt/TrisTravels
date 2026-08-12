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
      <section className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-14 lg:py-16">
        <FormCard className="overflow-hidden p-0 md:p-0">
          <div className="grid md:grid-cols-[0.9fr_1.1fr] lg:grid-cols-[1fr_1.15fr]">
            <div className="relative min-h-[200px] md:min-h-full">
              <Image
                src={media.heroMist}
                alt="Meghalaya mist and hills"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 45vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8 lg:p-10">
                <p className="label-caps text-accent">Your TRIS account</p>
                <p className="mt-2 font-display text-2xl leading-snug md:text-3xl">
                  Save wishlists, track bookings, and pick up enquiries.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-8 lg:p-10">
              <div className="mb-6 border-b border-outline-variant/20 pb-5">
                <h1 className="font-display text-2xl text-primary md:text-3xl">Log in</h1>
                <p className="mt-2 text-sm text-on-surface-variant">Welcome back.</p>
              </div>

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

              <div className="my-5 flex items-center gap-3">
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                {error && <p className="text-sm text-primary">{error}</p>}
                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-on-surface-variant">
                    New here?{" "}
                    <Link
                      href={
                        dest !== "/account" ? `/signup?next=${encodeURIComponent(dest)}` : "/signup"
                      }
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={busy || !configured}
                  >
                    {busy ? "Signing in…" : "Log in"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </FormCard>
      </section>
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
