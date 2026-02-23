"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/actions/auth";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // If no error, the server action will redirect
    } catch {
      // redirect() throws a NEXT_REDIRECT error — this is expected
      // Next.js handles the redirect automatically
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-foreground/10 bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-highlight"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-highlight"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-highlight px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-highlight/90 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

      </div>
    </div>
  );
}
