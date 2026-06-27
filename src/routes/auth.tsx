import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, CalendarDays, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — ENT Clinic CRM" }] }),
  component: AuthPage,
});

const FEATURES = [
  {
    icon: Users,
    text: "Complete patient history at your fingertips",
  },
  {
    icon: CalendarDays,
    text: "Smart follow-up & appointment scheduling",
  },
  {
    icon: Activity,
    text: "Daily consultation overview & analytics",
  },
];

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) navigate({ to: "/patients", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      navigate({ to: "/patients", replace: true });
    } catch (err) {
      toast.error((err as Error).message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (dark brand) ── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex lg:w-[46%]"
        style={{
          background: "linear-gradient(155deg, #0d2f30 0%, #091a28 55%, #070f1c 100%)",
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 0%, oklch(0.67 0.143 181 / 0.12) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-white">ENT Clinic</p>
              <p className="text-xs text-teal-300/70">Patient CRM</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-14">
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white">
              Better care starts
              <br />
              with better records.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Manage patients, consultations & follow-ups —{" "}
              all in one place built for ENT specialists.
            </p>
          </div>

          {/* Feature bullets */}
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom branding */}
        <p className="relative z-10 text-xs text-slate-600">
          © {new Date().getFullYear()} ENT Clinic CRM
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">ENT Clinic CRM</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your clinic dashboard</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email address
              </Label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="doctor@entclinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-shadow focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700"
                  onClick={() => toast.info("Password reset coming soon")}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-shadow focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-500 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400">
            ENT Clinic CRM · Secure & HIPAA-ready
          </p>
        </div>
      </div>
    </div>
  );
}
