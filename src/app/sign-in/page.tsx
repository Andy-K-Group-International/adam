"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { Check, Shield, Briefcase } from "lucide-react";

type PortalRole = "admin" | "client" | null;

function RoleBadge({ role }: { role: PortalRole }) {
  if (!role) return null;

  if (role === "admin") {
    return (
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 mx-auto"
        style={{ backgroundColor: "#0E282D", color: "#f0f4f4" }}
      >
        <Shield className="h-4 w-4 shrink-0" style={{ color: "#2F9E9A" }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#2F9E9A" }}>
          Admin Panel
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 mx-auto bg-foreground/6 text-foreground">
      <Briefcase className="h-4 w-4 shrink-0 text-foreground" />
      <span className="text-xs font-semibold tracking-widest uppercase text-muted-2">
        Client Portal
      </span>
    </div>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const messageParam = searchParams.get("message");
  const errorParam   = searchParams.get("error");
  const role         = (searchParams.get("role") ?? null) as PortalRole;

  const [error, setError]       = useState<string | null>(
    errorParam === "auth_callback_error" ? "Something went wrong. Please try again." : null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form     = new FormData(e.currentTarget);
    const email    = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await signIn(email, password);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  const heading = role === "admin"
    ? "Admin Sign In"
    : role === "client"
    ? "Client Portal"
    : "Sign in to your account";

  const subheading = role === "admin"
    ? "Andy’K Group internal access"
    : role === "client"
    ? "Access your proposals, contracts and more"
    : "Enter your credentials to continue";

  return (
    <div className="glass-card rounded-2xl border border-grid-300 overflow-hidden">
      {messageParam === "password-updated" && (
        <div className="flex items-center gap-3 px-8 py-4 bg-success/8 border-b border-success/20">
          <Check className="h-4 w-4 text-success shrink-0" />
          <p className="text-sm text-success">Password updated successfully. Please sign in.</p>
        </div>
      )}

      {/* Role accent strip for admin */}
      {role === "admin" && (
        <div style={{ height: 3, backgroundColor: "#2F9E9A" }} />
      )}

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-lg font-serif font-semibold text-foreground">
            {heading}
          </h1>
          <p className="text-sm text-muted-2 mt-1">{subheading}</p>
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="label-mono block">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-2 hover:text-highlight transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
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
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden bg-background">
      <div className="absolute inset-0 cartesian-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-10">
          <img src="/images/adam-logo.png" alt="A.D.A.M." style={{ height: "48px", width: "auto" }} className="mx-auto mb-3" />
          <p className="gradient-text font-bold tracking-tight text-3xl mb-1">A.D.A.M.</p>
          <p className="label-mono">Automated Document &amp; Account Manager</p>
        </div>

        {/* Role badge rendered inside Suspense since it reads searchParams */}
        <Suspense fallback={null}>
          <RoleBadgeFromParams />
        </Suspense>

        <Suspense fallback={<div className="glass-card rounded-2xl p-8 border border-grid-300 h-64" />}>
          <SignInForm />
        </Suspense>

        <p className="text-center text-xs text-muted-2 mt-6">
          <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-2">
            ← Return to andykgroup.com
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleBadgeFromParams() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") ?? null) as PortalRole;
  return (
    <div className="flex justify-center">
      <RoleBadge role={role} />
    </div>
  );
}
