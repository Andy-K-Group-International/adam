"use client";

import { useState, useEffect, useRef, useId } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualHelpProps {
  id: string;
  title: string;
  description: string;
  why?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function ContextualHelp({
  id,
  title,
  description,
  why,
  position = "top",
  className,
}: ContextualHelpProps) {
  const storageKey = `adam_help_dismissed_${id}`;
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(storageKey) === "1") {
      setHidden(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    if (dontShow) {
      localStorage.setItem(storageKey, "1");
      setHidden(true);
    }
    setOpen(false);
  }

  if (hidden) return null;

  const popoverClasses = cn(
    "absolute z-50 w-[300px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-lg border border-grid-300",
    "transition-all duration-150",
    open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
    position === "top"    && "bottom-full mb-2 left-1/2 -translate-x-1/2",
    position === "bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
    position === "left"   && "right-full mr-2 top-1/2 -translate-y-1/2",
    position === "right"  && "left-full ml-2 top-1/2 -translate-y-1/2",
  );

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        aria-label={`Help: ${title}`}
        aria-expanded={open}
        aria-controls={uid}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors",
          open
            ? "text-highlight bg-highlight/10"
            : "text-muted-2 hover:text-muted hover:bg-grid-300",
        )}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <div id={uid} role="tooltip" className={popoverClasses}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ fontFamily: "'IBM Plex Sans', 'Inter', sans-serif", color: "#0E282D" }}
          >
            {title}
          </p>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close help"
            className="shrink-0 mt-0.5 text-muted-2 hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Description */}
        <p
          className="px-4 pb-3 text-sm leading-relaxed text-muted"
          style={{ fontFamily: "'IBM Plex Sans', 'Inter', sans-serif" }}
        >
          {description}
        </p>

        {/* Why */}
        {why && (
          <div className="mx-4 mb-3 pt-3 border-t border-grid-300">
            <p
              className="text-xs italic leading-relaxed text-muted-2"
              style={{ fontFamily: "'IBM Plex Sans', 'Inter', sans-serif" }}
            >
              {why}
            </p>
          </div>
        )}

        {/* Don't show again */}
        <div className="px-4 pb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id={`${uid}-dismiss`}
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-grid-500 text-highlight focus:ring-0 cursor-pointer"
          />
          <label
            htmlFor={`${uid}-dismiss`}
            className="text-[11px] text-muted-2 cursor-pointer select-none"
            style={{ fontFamily: "'IBM Plex Sans', 'Inter', sans-serif" }}
          >
            Don&apos;t show again
          </label>
        </div>
      </div>
    </div>
  );
}
