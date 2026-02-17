"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  // Auto-fill from localStorage if previously saved
  useEffect(() => {
    const saved = localStorage.getItem("adam_email");
    if (saved) setEmail(saved);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    localStorage.setItem("adam_email", email.trim());
    router.push("/questionnaire");
  }

  return (
    <section id="hero" className="text-center py-20 px-8 max-w-[900px] mx-auto">
      <Image
        src="/adam-logo-simple-no-bg.png"
        alt="A.D.A.M. Logo"
        width={72}
        height={72}
        className="mx-auto mb-4"
        priority
      />
      <p className="gradient-text font-bold tracking-tight text-[clamp(2.375rem,1.6rem+2.75vw,3.75rem)] mb-2">
        A.D.A.M.
      </p>
      <h1 className="gradient-text tracking-tight leading-[1.2] text-[clamp(1.25rem,0.9rem+1.25vw,1.75rem)] mb-6 font-serif font-light italic">
        <span className="block">Automated Document</span>
        <span className="block">
          &amp; Account Manager
        </span>
      </h1>
      <p className="text-xl leading-relaxed text-muted font-light max-w-[620px] mx-auto mb-3">
        From understanding your clients needs, to <span className="italic font-normal">signed contracts</span>.
      </p>
      <p className="text-base leading-relaxed text-muted-2 font-light max-w-[540px] mx-auto mb-9">
        Powered by{" "}
        <a
          href="https://andykgroupinternational.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Andy&apos;K Group International.
        </a>
        <br/>
        <span className="font-bold"> Want to work with us?</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="inline w-4 h-4 ml-1 -mt-0.5 text-muted-2"><path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[560px] mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full sm:flex-1 h-12 px-4 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/40 focus:border-highlight transition-colors"
        />
        <button
          type="submit"
          className="relative inline-flex items-center justify-center h-12 px-5 text-sm font-medium text-foreground btn-primary-gradient w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <span className="relative z-10">Start Questionnaire</span>
        </button>
      </form>
    </section>
  );
}
