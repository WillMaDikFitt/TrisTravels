"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { FormCard, FormInput } from "@/components/ui/Form";
import { useAuth } from "@/components/auth/AuthProvider";

function safeNext(raw: string | null) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
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
      <div className="mx-auto max-w-md px-margin-mobile py-16 md:py-24">
        <FormCard title="Log in" subtitle="Save wishlists, track bookings, and pick up enquiries.">
          {!configured && (
            <p className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-secondary">
            Accounts aren’t available right now. Please try again later.
            </p>
          )}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => signIn(email, password));
            }}
          >
            <FormInput label="Email" name="email" type="email" value={email} onChange={setEmail} required />
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            {error && <p className="text-sm text-primary">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !configured}>
              {busy ? "Signing in…" : "Log in"}
            </Button>
          </form>
          <Button
            variant="ghost"
            className="mt-3 w-full"
            disabled={busy || !configured}
            onClick={() => run(() => signInGoogle())}
          >
            Continue with Google
          </Button>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            New here?{" "}
            <Link
              href={dest !== "/account" ? `/signup?next=${encodeURIComponent(dest)}` : "/signup"}
              className="text-primary underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </FormCard>
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
