import type { Questionnaire } from "@/lib/supabase/types";

// Thin client-side wrappers around the server-authoritative draft routes —
// replaces direct browser-client table access (previously gated only by an
// unscoped anon RLS policy) with calls the server enforces.

export async function getDraftRemote(params: {
  sessionToken?: string | null;
  email?: string;
}): Promise<Questionnaire | null> {
  const qs = new URLSearchParams();
  if (params.sessionToken) qs.set("sessionToken", params.sessionToken);
  else if (params.email) qs.set("email", params.email);
  else return null;

  const res = await fetch(`/api/questionnaire/draft?${qs.toString()}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.draft as Questionnaire | null;
}

export async function saveDraftRemote(params: {
  sessionToken?: string | null;
  email: string;
  answers: Record<string, unknown>;
  selectedSegments: string[];
  currentPageIndex: number;
}): Promise<{ draft: Questionnaire; sessionToken: string }> {
  const res = await fetch("/api/questionnaire/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to save draft");
  }
  return res.json();
}

export async function submitDraftRemote(params: {
  sessionToken?: string | null;
  email: string;
  answers: Record<string, unknown>;
  selectedSegments: string[];
}): Promise<{ questionnaire: Questionnaire }> {
  const res = await fetch("/api/questionnaire/draft/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to submit questionnaire");
  }
  return res.json();
}

export async function deleteDraftRemote(params: { sessionToken?: string | null; email?: string }): Promise<void> {
  await fetch("/api/questionnaire/draft", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch(() => {});
}
