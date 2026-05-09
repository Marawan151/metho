import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Loom" },
      { name: "description", content: "Admin dashboard for events and registrations." },
    ],
  }),
  component: AdminPage,
});

type EventRow = { id: string; title: string; slug: string; starts_at: string; capacity: number };
type RegRow = {
  id: string;
  full_name: string;
  email: string;
  ticket_type: string;
  created_at: string;
  event_id: string;
};
type OrderRow = {
  id: string;
  ticket_type: string;
  quantity: number;
  total_cents: number;
  status: string;
  created_at: string;
  events: { title: string } | null;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [regs, setRegs] = useState<RegRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tab, setTab] = useState<"events" | "registrations" | "orders">("events");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("events").select("id, title, slug, starts_at, capacity").order("starts_at").then(({ data }) =>
      setEvents((data as EventRow[]) ?? [])
    );
    supabase
      .from("registrations")
      .select("id, full_name, email, ticket_type, created_at, event_id")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRegs((data as RegRow[]) ?? []));
    supabase
      .from("orders")
      .select("id, ticket_type, quantity, total_cents, status, created_at, events(title)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderRow[]) ?? []));
  }, [isAdmin]);

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-20 text-muted-foreground">Loading…</div>;
  if (!user) return null;

  if (!isAdmin)
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Admin access only</h1>
        <p className="text-muted-foreground">
          Your account doesn't have admin permissions. Contact a site owner to be granted the{" "}
          <span className="font-mono">admin</span> role.
        </p>
      </div>
    );

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage events, registrations and orders.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Events" value={String(events.length)} />
        <Stat label="Registrations" value={String(regs.length)} />
        <Stat
          label="Revenue"
          value={formatPrice(orders.filter((o) => o.status === "confirmed").reduce((s, o) => s + o.total_cents, 0))}
        />
      </div>

      <div className="flex gap-2 border-b border-border">
        {(["events", "registrations", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <Table headers={["Title", "Slug", "Starts", "Capacity"]}>
          {events.map((e) => (
            <tr key={e.id} className="border-t border-border">
              <td className="py-3 px-4">{e.title}</td>
              <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{e.slug}</td>
              <td className="py-3 px-4 text-sm">{new Date(e.starts_at).toLocaleString()}</td>
              <td className="py-3 px-4 font-mono">{e.capacity}</td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "registrations" && (
        <Table headers={["Name", "Email", "Event", "Type", "When"]}>
          {regs.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="py-3 px-4">{r.full_name}</td>
              <td className="py-3 px-4 font-mono text-xs">{r.email}</td>
              <td className="py-3 px-4 text-sm">{eventTitle(r.event_id)}</td>
              <td className="py-3 px-4 capitalize text-sm">{r.ticket_type}</td>
              <td className="py-3 px-4 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "orders" && (
        <Table headers={["Event", "Qty/Type", "Total", "Status", "When"]}>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="py-3 px-4">{o.events?.title ?? "—"}</td>
              <td className="py-3 px-4 text-sm">
                {o.quantity} × <span className="capitalize">{o.ticket_type}</span>
              </td>
              <td className="py-3 px-4 font-mono">{formatPrice(o.total_cents)}</td>
              <td className="py-3 px-4 text-sm capitalize">{o.status}</td>
              <td className="py-3 px-4 text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card shadow-card ring-border-gradient p-5">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-display font-bold">{value}</div>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card shadow-card ring-border-gradient overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
