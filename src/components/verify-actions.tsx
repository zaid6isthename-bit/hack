"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyActions({ incidentId, compact = false }: { incidentId: string; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "yes" | "no">(null);
  const [error, setError] = useState("");

  async function respond(confirmed: boolean) {
    setBusy(confirmed ? "yes" : "no");
    setError("");
    try {
      const res = await fetch(`/api/incidents/${incidentId}/reopen`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update");
        setBusy(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className={`flex gap-2 ${compact ? "" : "flex-wrap"}`}>
        <button
          onClick={() => respond(true)}
          disabled={busy !== null}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-4 text-[12.5px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-60"
        >
          {busy === "yes" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Yes, it&apos;s fixed
        </button>
        <button
          onClick={() => respond(false)}
          disabled={busy !== null}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-500/15 px-4 text-[12.5px] font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
        >
          {busy === "no" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
          No, still broken
        </button>
      </div>
      {error && <p className="mt-2 text-[11.5px] text-rose-300">{error}</p>}
    </div>
  );
}
