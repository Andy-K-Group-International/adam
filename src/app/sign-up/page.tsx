"use client";

import { useEffect } from "react";

export default function SignUpPage() {
  useEffect(() => {
    window.location.href = "/auth/login?screen_hint=signup";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-grid-500 border-t-highlight mx-auto mb-4" />
        <p className="text-muted">Redirecting to sign up...</p>
      </div>
    </div>
  );
}
