import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/confirmation/$orderId")({
  head: () => ({
    meta: [
      { title: "Confirmed — Loom" },
      { name: "description", content: "Your event registration is confirmed." },
    ],
  }),
  component: ConfirmationPage,
});

type Order = {
  id: string;
  ticket_type: string;
  quantity: number;
  total_cents: number;
  events: { title: string; slug: string; starts_at: string; location: string } | null;
};

function ConfirmationPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, ticket_type, quantity, total_cents, events(title, slug, starts_at, location)")
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setOrder(data as Order);
      });
  }, [orderId]);

  if (notFound)
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Order not found</h1>
        <p className="text-muted-foreground">
          You may need to{" "}
          <Link to="/login" className="text-primary hover:underline">
            sign in
          </Link>{" "}
          to view it.
        </p>
      </div>
    );

  if (!order) return <div className="mx-auto max-w-2xl px-6 py-20 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="text-6xl mb-4">✦</div>
      <h1 className="font-display text-4xl font-bold mb-2">You're confirmed</h1>
      <p className="text-muted-foreground mb-10">A confirmation email is on its way.</p>

      <div className="rounded-2xl bg-card shadow-card ring-border-gradient p-8 text-left space-y-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Event</div>
          <div className="font-display text-xl font-semibold">{order.events?.title}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {order.events && new Date(order.events.starts_at).toLocaleString()} · {order.events?.location}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <Stat label="Tickets" value={`${order.quantity} × ${order.ticket_type}`} />
          <Stat label="Total paid" value={formatPrice(order.total_cents)} />
          <Stat label="Order ID" value={order.id.slice(0, 8)} mono />
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/events"
          className="rounded-lg border border-border px-5 py-2.5 text-sm hover:text-foreground text-muted-foreground"
        >
          Browse more events
        </Link>
        <Link
          to="/profile"
          className="rounded-lg bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-glow"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-medium ${mono ? "font-mono text-sm" : ""}`}>{value}</div>
    </div>
  );
}
