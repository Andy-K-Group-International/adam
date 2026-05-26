"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "adam_welcome_shown";

export default function WelcomePopover() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(1,1,27,0.35)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-grid-300 p-8"
        style={{ fontFamily: "'IBM Plex Sans', 'Inter', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Monogram */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-highlight/10 flex items-center justify-center shrink-0">
            <span className="text-highlight font-bold text-sm tracking-tight">A</span>
          </div>
          <div>
            <p className="text-[11px] font-mono text-muted-2 uppercase tracking-widest">A.D.A.M.</p>
            <p className="text-base font-semibold text-foreground leading-tight">Welcome to A.D.A.M.</p>
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed mb-6">
          This is your private operational portal. Here you will find your proposals, contracts, invoices and implementation progress. If you have any questions, use the <span className="font-medium text-foreground">Request Changes</span> feature on any document.
        </p>

        <div className="border-t border-grid-300 pt-4">
          <button
            onClick={dismiss}
            className="w-full h-10 rounded-lg bg-highlight text-white text-sm font-medium hover:bg-highlight/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
