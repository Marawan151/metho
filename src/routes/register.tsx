import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Loom" },
      { name: "description", content: "Create a Loom account to register for tech events." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  display_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(128),
});

function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ display_name: name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const redirectUrl = `${window.location.origin}/profile`;
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: parsed.data.display_name },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — check your email to verify.");
    nav({ to: "/login" });
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl font-bold mb-2">Create account</h1>
      <p className="text-muted-foreground mb-8">Track your registrations and orders.</p>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-card shadow-card ring-border-gradient p-6">
        <Field label="Display name" value={name} onChange={setName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-gradient-primary text-primary-foreground font-medium py-3 shadow-glow hover:opacity-95 transition disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
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
