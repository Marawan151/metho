import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Loom" },
      { name: "description", content: "Sign in to manage your event registrations." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    nav({ to: "/profile" });
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Sign in</h1>
      <p className="text-muted-foreground mb-8">Manage your registrations and orders.</p>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-card shadow-card ring-border-gradient p-6">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-gradient-primary text-primary-foreground font-medium py-3 shadow-glow hover:opacity-95 transition disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-muted-foreground text-center">
          No account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-lg bg-input/60 border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 transition"
      />
    </label>
  );
}
