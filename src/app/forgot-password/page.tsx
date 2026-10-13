"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormCard, FormInput } from "@/components/ui/Form";
import { useAuth } from "@/components/auth/AuthProvider";
import { media } from "@/data/media";

function ForgotPasswordForm() {
  const search = useSearchParams();
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState(search.get("email") ?? "");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);

  // Auto-dismiss errors after 4s.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await resetPassword(email.trim());
      setSentTo(email.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send reset email");
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/25" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8 lg:p-10">
                <p className="label-caps text-white/70">Your TRIS account</p>
                <p className="mt-2 font-display text-2xl leading-snug md:text-3xl">
                  Locked out? We&apos;ll get you back on the trail.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-8 lg:p-10">
              <div className="mb-6 border-b border-outline-variant/20 pb-5">
                <h1 className="font-display text-2xl text-primary md:text-3xl">Reset password</h1>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Enter your account email and we&apos;ll send you a link to set a new password.
                </p>
              </div>

              {!configured && (
                <p className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-secondary">
                  Accounts aren&apos;t available right now. Please try again later.
                </p>
              )}

              {sentTo ? (
                <div className="space-y-5">
                  <p className="rounded-xl bg-secondary-container px-4 py-3 text-sm text-primary" role="status">
                    If an account exists for <strong>{sentTo}</strong>, a reset link is on its way.
                    Check your inbox (and spam folder).
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Signed up with Google? You don&apos;t need a password — just use “Continue with
                    Google” on the login page.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setSentTo("")}
                      className="text-left text-sm font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Use a different email
                    </button>
                    <Button href="/login" size="lg" className="w-full sm:w-auto">
                      Back to log in
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
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
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-on-surface-variant">
                      Remembered it?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        Log in
                      </Link>
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={busy || !configured}
                    >
                      {busy ? "Sending…" : "Send reset link"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </FormCard>
      </section>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="pt-header p-16 text-on-surface-variant">Loading…</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
