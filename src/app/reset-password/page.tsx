"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
      } else {
        setSessionError("This reset link has expired or is invalid.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push("/sign-in?message=password-updated"), 1500);
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
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-success" />
              </div>
              <h1 className="text-lg font-serif font-semibold text-foreground mb-2">
                Password updated
              </h1>
              <p className="text-sm text-muted-2">Redirecting you to sign in…</p>
            </div>
          ) : sessionError ? (
            <div className="text-center py-4">
              <div className="mb-6">
                <h1 className="text-lg font-serif font-semibold text-foreground mb-2">
                  Link expired
                </h1>
                <p className="text-sm text-muted-2">{sessionError}</p>
              </div>
              <Link
                href="/forgot-password"
                className="relative inline-flex w-full items-center justify-center h-12 px-5 text-sm font-medium text-foreground btn-primary-gradient"
              >
                <span className="relative z-10">Request a new link</span>
              </Link>
            </div>
          ) : !isReady ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-highlight border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-serif font-semibold text-foreground">
                  Set a new password
                </h1>
                <p className="text-sm text-muted-2 mt-1">
                  Choose a strong password — at least 8 characters
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="password" className="label-mono block">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm" className="label-mono block">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative inline-flex w-full items-center justify-center h-12 px-5 text-sm font-medium text-foreground btn-primary-gradient mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isLoading ? "Updating…" : "Update password"}
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
