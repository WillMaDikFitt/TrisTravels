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

function SignupForm() {
  const router = useRouter();
  const dest = safeNext(useSearchParams().get("next"));
  const { signUp, signInGoogle, configured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="bg-background pt-header">
      <div className="mx-auto max-w-md px-margin-mobile py-16 md:py-24">
        <FormCard title="Create account" subtitle="Traveller accounts — wishlist, bookings, and enquiries.">
          {!configured && (
            <p className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-secondary">
              Sign-up isn’t available right now. Please try again later.
            </p>
          )}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await signUp(name, email, password);
                router.push(dest);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not sign up");
              } finally {
                setBusy(false);
              }
            }}
          >
            <FormInput label="Full name" name="name" value={name} onChange={setName} required />
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
              {busy ? "Creating…" : "Sign up"}
            </Button>
          </form>
          <Button
            variant="ghost"
            className="mt-3 w-full"
            disabled={!configured}
            onClick={async () => {
              try {
                await signInGoogle();
                router.push(dest);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Google sign-in failed");
              }
            }}
          >
            Continue with Google
          </Button>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href={dest !== "/account" ? `/login?next=${encodeURIComponent(dest)}` : "/login"}
              className="text-primary underline-offset-2 hover:underline"
            >
              Log in
            </Link>
          </p>
        </FormCard>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="pt-header p-16 text-on-surface-variant">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
