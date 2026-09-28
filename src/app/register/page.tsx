"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import { inputClass } from "@/components/ui/primitives";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [role, setRole] = useState<"STUDENT" | "FACULTY">("STUDENT");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not register");
        setPending(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — try again");
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 10%, rgba(129,140,248,0.12), transparent 45%), radial-gradient(circle at 10% 90%, rgba(56,189,248,0.1), transparent 45%), linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 48px 48px, 48px 48px",
        }}
      />
      <div className="relative z-10 w-full max-w-[420px] animate-rise">
        <Link href="/" className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-[#04121d]">
            <Zap size={18} strokeWidth={2.6} />
          </span>
          <span className="text-[16px] font-semibold tracking-tight">CampusFix AI</span>
        </Link>

        <div className="panel grain p-6">
          <h1 className="text-[20px] font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-[13px] text-muted">Report campus problems in your own words.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="label-xs mb-1.5 block">Full name</span>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Aarav Sharma"
                required
              />
            </label>
            <label className="block">
              <span className="label-xs mb-1.5 block">College email</span>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@campus.edu"
                required
              />
            </label>
            <label className="block">
              <span className="label-xs mb-1.5 block">Password</span>
              <input
                className={inputClass}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                required
              />
            </label>

            <div>
              <span className="label-xs mb-1.5 block">I am a</span>
              <div className="grid grid-cols-2 gap-2">
                {(["STUDENT", "FACULTY"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-2.5 text-[13px] font-medium transition ${
                      role === r ? "border-accent/60 bg-accent/10 text-accent" : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {r === "STUDENT" ? "Student" : "Faculty"}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[14px] font-semibold text-[#04121d] transition hover:bg-sky-300 disabled:opacity-60"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={2.5} />}
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-muted">
          Already registered?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
