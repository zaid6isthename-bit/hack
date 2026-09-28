"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import { inputClass } from "@/components/ui/primitives";

const DEMO = [
  { label: "Student", email: "student@demo.com" },
  { label: "Staff", email: "staff@demo.com" },
  { label: "Admin", email: "admin@demo.com" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent, override?: { email: string; password: string }) {
    e?.preventDefault();
    setPending(true);
    setError("");
    const payload = override ?? { email, password };
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not sign in");
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
            "radial-gradient(circle at 20% 10%, rgba(56,189,248,0.12), transparent 45%), radial-gradient(circle at 80% 90%, rgba(129,140,248,0.1), transparent 45%), linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
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
          <h1 className="text-[20px] font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-[13px] text-muted">Access your campus issue workspace.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="label-xs mb-1.5 block">Email</span>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="label-xs mb-1.5 block">Password</span>
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

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
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-line pt-5">
            <div className="label-xs mb-2.5">Demo logins — one click</div>
            <div className="grid gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={(e) => submit(e, { email: d.email, password: "demo1234" })}
                  disabled={pending}
                  className="flex items-center justify-between rounded-lg border border-line bg-bg2 px-3.5 py-2.5 text-left text-[12.5px] transition hover:border-accent/50 hover:bg-accent/5 disabled:opacity-60"
                >
                  <span className="font-medium text-ink">{d.label}</span>
                  <span className="num text-[11.5px] text-faint">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-muted">
          No account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register as a student
          </Link>
        </p>
      </div>
    </div>
  );
}
