"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await signIn(email, password);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden bg-background">
      {/* Background layers */}
      <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        {/* Branding */}
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
          <p className="label-mono">Automated Document & Account Manager</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 border border-grid-300">
          <div className="mb-6">
            <h1 className="text-lg font-serif font-semibold text-foreground">Sign in to your account</h1>
            <p className="text-sm text-muted-2 mt-1">Enter your credentials to continue</p>
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
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="label-mono block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative inline-flex w-full items-center justify-center h-12 px-5 text-sm font-medium text-foreground btn-primary-gradient mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{isLoading ? "Signing in…" : "Sign in"}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-2 mt-6">
          <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-2">
            ← Return to andykgroup.com
          </Link>
        </p>
      </div>
    </div>
  );
}
