import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Loom" },
      { name: "description", content: "Manage your profile and view your event orders." },
    ],
  }),
  component: ProfilePage,
});

type Order = {
  id: string;
  ticket_type: string;
  quantity: number;
  total_cents: number;
  status: string;
  created_at: string;
  events: { title: string; slug: string } | null;
};

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, company")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? "");
          setCompany(data.company ?? "");
        }
      });
    supabase
      .from("orders")
      .select("id, ticket_type, quantity, total_cents, status, created_at, events(title, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, display_name: displayName, company }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  if (loading || !user) return <div className="mx-auto max-w-3xl px-6 py-20 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Your profile</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{user.email}</p>
        </div>
        <button onClick={() => signOut()} className="text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </button>
      </div>

      <section className="rounded-2xl bg-card shadow-card ring-border-gradient p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold">Details</h2>
        <Field label="Display name" value={displayName} onChange={setDisplayName} />
        <Field label="Company" value={company} onChange={setCompany} />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gradient-primary text-primary-foreground font-medium px-5 py-2.5 shadow-glow hover:opacity-95 transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Your orders</h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No orders yet.{" "}
            <Link to="/events" className="text-primary hover:underline">
              Browse events
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl bg-card ring-1 ring-border p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{o.events?.title ?? "Event"}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {o.quantity} × {o.ticket_type} · {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{formatPrice(o.total_cents)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{o.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-input/60 border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 transition"
      />
    </label>
  );
}
