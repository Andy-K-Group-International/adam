"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerSeller } from "@/app/actions/sellers";

export default function SellerRegisterPage() {
  return (
    <Suspense fallback={null}>
      <SellerRegisterForm />
    </Suspense>
  );
}

function SellerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const name = searchParams.get("name") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This registration link is missing its token. Please use the link from your invitation email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await registerSeller({ token, password });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    // Seller Partner Agreement + NDA step ships in the next phase of this
    // feature — this route isn't live yet.
    router.push("/seller-agreement");
  }

  const inputClass =
    "w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors";

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
          <p className="label-mono">Seller Partner Registration</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-grid-300">
          <div className="mb-6">
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Set up your account
            </h1>
            <p className="text-sm text-muted-2 mt-1">
              {name ? `Welcome, ${name}. ` : ""}
              Choose a password to finish creating your seller partner account.
            </p>
          </div>

          {email && (
            <div className="mb-4 rounded-lg bg-grid-300/30 border border-grid-300 px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-2 mb-0.5">Invited Email</p>
              <p className="text-sm text-foreground">{email}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="password" className="label-mono block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Min. 8 characters"
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
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
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
              disabled={loading}
              className="relative inline-flex w-full items-center justify-center h-12 px-5 text-sm font-medium text-foreground btn-primary-gradient mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {loading ? "Setting up…" : "Create account"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
