"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { submitNdaSignature } from "@/app/actions/nda";

// ─── NDA document ─────────────────────────────────────────────────────────────

function NdaDocument() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  return (
    <div className="text-[13.5px] leading-relaxed text-muted space-y-5">
      <div className="text-center space-y-1 pb-4 border-b border-grid-300">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-2">Confidential</p>
        <h2 className="text-base font-bold text-foreground tracking-tight">Non-Disclosure Agreement</h2>
        <p className="text-xs text-muted-2 font-mono">Effective date: {today}</p>
      </div>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">Parties</h3>
        <p>
          <strong className="text-foreground">Disclosing Party:</strong> Andy&apos;K Group
          International LTD, company number 16453500, registered at 86&ndash;90 Paul Street,
          London, EC2A 4NE, United Kingdom (&ldquo;Andy&apos;K Group&rdquo;).
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Receiving Party:</strong> The individual and/or
          organisation identified in the signature block below (&ldquo;Recipient&rdquo;).
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">Recitals</h3>
        <p>
          Andy&apos;K Group operates A.D.A.M. (AI-Powered Business Development Operating System)
          and may disclose certain Confidential Information to the Recipient in connection with a
          demonstration, evaluation, or potential commercial engagement. Both parties wish to protect
          that information on the terms set out in this Agreement.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">1. Confidential Information</h3>
        <p>
          &ldquo;Confidential Information&rdquo; means any non-public information disclosed by
          Andy&apos;K Group to the Recipient, whether disclosed orally, in writing, visually, or
          by any other means, including but not limited to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>System architecture, functionality, and demonstrations of A.D.A.M.</li>
          <li>Pricing, commercial terms, fee structures, and business models</li>
          <li>Business strategy, product roadmaps, and development plans</li>
          <li>Internal processes, workflows, operational systems, and methodologies</li>
          <li>Client data, client lists, prospect data, and engagement details</li>
          <li>Proprietary technology, source code, algorithms, and integrations</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">2. Obligations of the Recipient</h3>
        <p>The Recipient agrees to:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Keep all Confidential Information strictly confidential</li>
          <li>Not disclose Confidential Information to any third party without prior written consent from Andy&apos;K Group</li>
          <li>Use Confidential Information solely for the purpose of evaluating a potential engagement with Andy&apos;K Group</li>
          <li>Apply at least the same degree of care as it applies to its own confidential information (no less than reasonable care)</li>
          <li>Limit access to Confidential Information to its employees and advisers who have a need to know and who are bound by equivalent confidentiality obligations</li>
          <li>Promptly notify Andy&apos;K Group of any actual or suspected unauthorised disclosure</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">3. Exclusions</h3>
        <p>Obligations under this Agreement do not apply to information that:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Was already in the Recipient&apos;s possession and not subject to confidentiality restrictions prior to disclosure</li>
          <li>Is or becomes publicly available through no act or omission of the Recipient</li>
          <li>Is independently developed by the Recipient without reference to or use of the Confidential Information</li>
          <li>Is received from a third party who is not under any confidentiality obligation in respect of that information</li>
          <li>Must be disclosed pursuant to applicable law, regulation, or court order — provided the Recipient gives Andy&apos;K Group prompt prior written notice (where permitted) and cooperates with any application to limit disclosure</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">4. Term</h3>
        <p>
          This Agreement commences on the effective date above and remains in force for a period of{" "}
          <strong className="text-foreground">two (2) years</strong>. The obligations of
          confidentiality with respect to any Confidential Information disclosed during the term
          shall survive expiry.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">5. Return or Destruction of Information</h3>
        <p>
          Upon request by Andy&apos;K Group or upon termination of discussions between the parties,
          the Recipient shall promptly return or destroy all Confidential Information in its
          possession (including copies and extracts), and certify such destruction in writing if
          requested.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">6. No Licence or Commitment</h3>
        <p>
          Nothing in this Agreement grants the Recipient any right, licence, or interest in any
          intellectual property of Andy&apos;K Group. This Agreement does not obligate either party
          to enter into any further agreement, transaction, or business relationship.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">7. Remedies</h3>
        <p>
          The Recipient acknowledges that any breach of this Agreement may cause irreparable harm
          to Andy&apos;K Group for which monetary damages would be an inadequate remedy, and that
          Andy&apos;K Group shall be entitled to seek equitable relief (including injunction and
          specific performance) without the need to prove actual damages or post any bond.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">8. Governing Law &amp; Jurisdiction</h3>
        <p>
          This Agreement is governed by the laws of England and Wales. The parties irrevocably
          submit to the exclusive jurisdiction of the courts of England and Wales to resolve any
          dispute arising out of or in connection with this Agreement.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2 mb-2">9. Entire Agreement</h3>
        <p>
          This Agreement constitutes the entire agreement between the parties with respect to its
          subject matter and supersedes all prior discussions, representations, and agreements
          relating to confidentiality. Any amendment must be in writing and signed by both parties.
        </p>
      </section>
    </div>
  );
}

// ─── Signature canvas ─────────────────────────────────────────────────────────

function SignatureCanvas({
  canvasRef,
  onHasSignature,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onHasSignature: (v: boolean) => void;
}) {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0E282D";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [canvasRef]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    onHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onHasSignature(false);
  };

  return (
    <div>
      <div className="border border-grid-500 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={160}
          className="w-full cursor-crosshair touch-none block"
          style={{ height: "120px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 text-xs text-muted-2 hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Clear signature
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NdaSignPage() {
  return (
    <Suspense fallback={null}>
      <NdaSignForm />
    </Suspense>
  );
}

function NdaSignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    full_name: searchParams.get("name") ?? "",
    company: searchParams.get("company") ?? "",
    email: searchParams.get("email") ?? "",
    job_title: "",
  });
  const [hasSignature, setHasSignature] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!hasSignature) {
      setError("Please draw your signature before submitting.");
      return;
    }
    if (!agreed) {
      setError("Please confirm you have read and agree to the NDA.");
      return;
    }

    const signatureData = canvasRef.current?.toDataURL("image/png") ?? "";

    setLoading(true);
    const result = await submitNdaSignature({
      full_name: form.full_name,
      company: form.company,
      email: form.email,
      job_title: form.job_title,
      signature_data: signatureData,
    });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      router.push(`/nda-sign/success?token=${result.demoToken}`);
    }
  }

  const inputClass =
    "w-full h-11 px-3.5 border border-grid-500 bg-white text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors";

  return (
    <main className="min-h-screen bg-background">
      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 cartesian-grid opacity-30" />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-6 py-14 md:py-20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Image
            src="/adam-logo-simple-no-bg.png"
            alt="A.D.A.M."
            width={36}
            height={36}
            priority
          />
          <div>
            <p className="gradient-text font-bold tracking-tight text-lg leading-none">A.D.A.M.</p>
            <p className="text-[10px] font-mono text-muted-2 uppercase tracking-[0.15em] mt-0.5">
              Non-Disclosure Agreement
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
          Sign the NDA
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-8 max-w-[560px]">
          Before we schedule your A.D.A.M. demo, please review and sign this
          Non-Disclosure Agreement. It protects the confidential information shared during
          our discussions.
        </p>

        {/* NDA document */}
        <div className="rounded-xl border border-grid-300 bg-white mb-8">
          <div className="px-6 py-4 border-b border-grid-300 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-muted-2">
              NDA Document
            </span>
            <span className="text-[10px] font-mono text-muted-2">
              Andy&apos;K Group International LTD
            </span>
          </div>
          <div className="px-6 py-5 max-h-[420px] overflow-y-auto overscroll-contain">
            <NdaDocument />
          </div>
        </div>

        {/* Signing form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Agreement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 border-2 transition-colors flex items-center justify-center ${
                  agreed
                    ? "border-highlight bg-highlight"
                    : "border-grid-500 bg-white group-hover:border-highlight/60"
                }`}
              >
                {agreed && (
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-muted leading-relaxed">
              I have read and understood the Non-Disclosure Agreement above. I agree to its
              terms on behalf of myself and/or the organisation I represent.
            </span>
          </label>

          <div className="border-t border-grid-300" />

          {/* Form fields */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">Signatory details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                  Full Name <span className="text-highlight">*</span>
                </label>
                <input
                  required
                  value={form.full_name}
                  onChange={set("full_name")}
                  placeholder="Jane Smith"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                  Company Name <span className="text-highlight">*</span>
                </label>
                <input
                  required
                  value={form.company}
                  onChange={set("company")}
                  placeholder="Acme Ltd"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                  Email Address <span className="text-highlight">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="jane@acme.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                  Job Title <span className="text-highlight">*</span>
                </label>
                <input
                  required
                  value={form.job_title}
                  onChange={set("job_title")}
                  placeholder="Chief Executive Officer"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-[0.12em] text-muted-2 block">
                  Date
                </label>
                <input
                  readOnly
                  value={today}
                  className={`${inputClass} bg-grid-300/40 text-muted-2 cursor-default`}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-grid-300" />

          {/* Signature */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Digital signature</h3>
            <p className="text-xs text-muted-2 mb-3">
              Draw your signature in the box below using your mouse or finger.
            </p>
            <SignatureCanvas canvasRef={canvasRef} onHasSignature={setHasSignature} />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="relative inline-flex w-full items-center justify-center h-12 px-6 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {loading ? "Submitting…" : "I agree and sign"}
              </span>
            </button>
            <p className="text-center text-xs text-muted-2 mt-3">
              By clicking &ldquo;I agree and sign&rdquo;, you are entering into a legally
              binding agreement with Andy&apos;K Group International LTD.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-grid-300 text-center">
          <p className="text-xs text-muted-2 font-mono">
            Andy&apos;K Group International LTD &middot; Reg: 16453500
            &middot; 86&ndash;90 Paul Street, London, EC2A 4NE
          </p>
          <a
            href="https://adam.andykgroup.com"
            className="text-xs text-muted-2 hover:text-foreground transition-colors underline underline-offset-2 mt-1 inline-block"
          >
            adam.andykgroup.com
          </a>
        </div>
      </div>
    </main>
  );
}
