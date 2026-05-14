"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://adam.andykgroup.com/auth/callback?next=/reset-password",
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden bg-background">
      <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-10">
          <Image
            src="/adam-logo-simple-no-bg.png"
            alt="A.D.A.M."
            width={60}
            height={60}
            className="mx-auto mb-5"
            priority
          />
          <p className="gradient-text font-bold tracking-tight text-3xl mb-1">A.D.A.M.</p>
          <p className="label-mono">Automated Document &amp; Account Manager</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-grid-300">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-success" />
              </div>
              <h1 className="text-lg font-serif font-semibold text-foreground mb-2">
                Check your email
              </h1>
              <p className="text-sm text-muted-2 leading-relaxed">
                We sent a password reset link to{" "}
                <strong className="text-foreground">{email}</strong>. It expires in 1 hour.
              </p>
              <Link
                href="/sign-in"
                className="mt-6 inline-block text-sm text-highlight hover:underline underline-offset-2"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-serif font-semibold text-foreground">
                  Reset your password
                </h1>
                <p className="text-sm text-muted-2 mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="label-mono block">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                    placeholder="you@company.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative inline-flex w-full items-center justify-center h-12 px-5 text-sm font-medium text-foreground btn-primary-gradient mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isLoading ? "Sending…" : "Send reset link"}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-2 mt-6">
          <Link
            href="/sign-in"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
