"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Plus, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface FoundingCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  used_by_email: string | null;
  used_by_company: string | null;
  used_at: string | null;
  active: boolean;
  created_at: string;
}

const MAX_CODES = 20;

export default function FoundingCodesPage() {
  const [codes, setCodes]             = useState<FoundingCode[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [discount, setDiscount]       = useState(20);
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/founding-codes");
    if (res.ok) {
      const data = await res.json();
      setCodes(data.codes ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generate() {
    setGenerating(true);
    setError(null);
    const res = await fetch("/api/admin/founding-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discount_percent: discount }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to generate code");
    } else {
      await load();
    }
    setGenerating(false);
  }

  async function toggle(code: FoundingCode) {
    setTogglingId(code.id);
    await fetch("/api/admin/founding-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: code.id, active: !code.active }),
    });
    await load();
    setTogglingId(null);
  }

  async function copyCode(id: string, code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const used   = codes.filter((c) => c.used_count > 0).length;
  const active = codes.filter((c) => c.active && c.used_count === 0).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Founding Clients</h1>
        <p className="text-sm text-muted-2">Manage Founding Client discount codes — max 20 codes total.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Codes", value: `${total} / ${MAX_CODES}` },
          { label: "Used",        value: used },
          { label: "Available",   value: active },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-grid-300 p-5">
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="label-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Generate */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Generate New Code</h3>
        <div className="flex items-end gap-4">
          <div>
            <label className="label-mono block mb-1.5">Discount %</label>
            <div className="flex items-center gap-2">
              {[0, 10, 15, 20].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscount(d)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium border transition-colors",
                    discount === d
                      ? "bg-foreground text-white border-foreground"
                      : "bg-white text-muted border-grid-300 hover:border-foreground"
                  )}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating || total >= MAX_CODES}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-white text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate Code
          </button>
        </div>
        {total >= MAX_CODES && (
          <p className="text-xs text-warning mt-2">Maximum of 20 Founding Client codes reached.</p>
        )}
        {error && <p className="text-xs text-error mt-2">{error}</p>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="px-5 py-4 border-b border-grid-300">
          <h3 className="text-sm font-semibold text-foreground">All Codes</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-2 text-sm">Loading…</div>
        ) : codes.length === 0 ? (
          <div className="p-8 text-center text-muted-2 text-sm">No codes yet. Generate the first one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid-300">
                  {["Code", "Discount", "Used by", "Company", "Date Used", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left label-mono font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-grid-200">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-grid-100">
                    <td className="px-5 py-3 font-mono text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        {code.code}
                        <button
                          onClick={() => copyCode(code.id, code.code)}
                          className="text-muted-2 hover:text-foreground transition-colors"
                        >
                          {copiedId === code.id
                            ? <Check className="h-3.5 w-3.5 text-success" />
                            : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground font-medium">
                      {code.discount_percent}%
                    </td>
                    <td className="px-5 py-3 text-muted-2">
                      {code.used_by_email ?? <span className="text-muted-2/50">—</span>}
                    </td>
                    <td className="px-5 py-3 text-muted-2">
                      {code.used_by_company ?? <span className="text-muted-2/50">—</span>}
                    </td>
                    <td className="px-5 py-3 text-muted-2">
                      {code.used_at ? formatDate(code.used_at) : <span className="text-muted-2/50">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {code.used_count > 0 ? (
                        <span className="px-2 py-0.5 text-xs bg-grid-300 text-muted rounded-full font-mono">Used</span>
                      ) : code.active ? (
                        <span className="px-2 py-0.5 text-xs bg-success/10 text-success rounded-full font-mono">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-error/10 text-error rounded-full font-mono">Disabled</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {code.used_count === 0 && (
                        <button
                          onClick={() => toggle(code)}
                          disabled={togglingId === code.id}
                          className="text-muted-2 hover:text-foreground transition-colors disabled:opacity-50"
                          title={code.active ? "Disable" : "Enable"}
                        >
                          {togglingId === code.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : code.active
                              ? <ToggleRight className="h-5 w-5 text-success" />
                              : <ToggleLeft className="h-5 w-5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
