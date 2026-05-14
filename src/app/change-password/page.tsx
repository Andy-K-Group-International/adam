"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changePasswordAction } from "@/app/actions/auth";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (userLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password");
      return;
    }

    setIsLoading(true);
    const result = await changePasswordAction(currentPassword, newPassword);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push(user?.role === "client" ? "/dashboard" : "/admin");
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
          <div className="mb-6">
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Set your password
            </h1>
            <p className="text-sm text-muted-2 mt-1">
              You're signed in with a temporary password. Please set a new one to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="current" className="label-mono block">
                Current (temporary) password
              </label>
              <div className="relative">
                <input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="label-mono block">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-11 rounded-lg border border-grid-500 bg-white px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                {isLoading ? "Updating…" : "Set new password"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
