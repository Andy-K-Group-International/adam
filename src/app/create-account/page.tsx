"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function CreateAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adam_email");
    if (saved) setEmail(saved);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is missing. Please start from the homepage.");
      return;
    }
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (trimmedFirst.length < 2) {
      setError("First name must be at least 2 characters.");
      return;
    }
    if (trimmedLast.length < 2) {
      setError("Last name must be at least 2 characters.");
      return;
    }
    if (/[^a-zA-ZÀ-ÿ\s'-]/.test(trimmedFirst) || /[^a-zA-ZÀ-ÿ\s'-]/.test(trimmedLast)) {
      setError("Names can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must include at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must include at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must include at least one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.");
        return;
      }

      // Redirect to Auth0 login with email pre-filled
      window.location.href = `/auth/login?login_hint=${encodeURIComponent(email)}`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/adam-logo-simple-no-bg.png"
            alt="A.D.A.M. Logo"
            width={56}
            height={56}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Create your account
          </h1>
          <p className="text-sm text-muted">
            Set up your login to track progress and access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email — read-only */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full h-11 px-3 border border-grid-500 bg-grid-100 text-sm text-muted cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                First name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full h-11 px-3 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Last name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full h-11 px-3 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-3 pr-10 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-2 mt-1.5">
              Min. 8 characters, with uppercase, lowercase, and a number.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full h-11 px-3 pr-10 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-2 mt-6">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-highlight hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
