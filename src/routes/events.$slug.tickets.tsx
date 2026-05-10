import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { TICKET_PRICES_CENTS, formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/events/$slug/tickets")({
  head: () => ({
    meta: [
      { title: "Choose tickets — Loom" },
      { name: "description", content: "Select your ticket type and quantity for this event." },
    ],
  }),
  component: TicketsPage,
});

const TYPES = ["standard", "student", "vip"] as const;

function TicketsPage() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState<Tables<"events"> | null>(null);
  const [type, setType] = useState<(typeof TYPES)[number]>("standard");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => setEvent(data));
  }, [slug]);

  if (!event)
    return <div className="mx-auto max-w-3xl px-6 py-20 text-muted-foreground">Loading…</div>;

  function proceed() {
    if (!event) return;
    const params = new URLSearchParams({ type, qty: String(qty) });
    nav({ to: `/checkout/${event.slug}?${params.toString()}` });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <Link to="/events/$slug" params={{ slug }} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to event
      </Link>
      <div>
        <h1 className="font-display text-4xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground mt-2">{event.tagline}</p>
      </div>

      <section className="rounded-2xl bg-card shadow-card ring-border-gradient p-6 space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold mb-3">Ticket type</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-xl p-4 text-left border transition ${
                  type === t
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                    : "bg-input/40 border-border hover:text-foreground text-muted-foreground"
                }`}
              >
                <div className="font-medium capitalize">{t}</div>
                <div className="text-sm font-mono mt-1">
                  {formatPrice(TICKET_PRICES_CENTS[t])}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold mb-3">Quantity</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 rounded-lg bg-input/60 border border-border hover:text-foreground"
            >
              −
            </button>
            <div className="w-12 text-center font-mono text-lg">{qty}</div>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              className="h-10 w-10 rounded-lg bg-input/60 border border-border hover:text-foreground"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subtotal</div>
            <div className="text-2xl font-display font-bold">
              {formatPrice(TICKET_PRICES_CENTS[type] * qty)}
            </div>
          </div>
          <button
            onClick={proceed}
            className="rounded-lg bg-gradient-primary text-primary-foreground font-medium px-6 py-3 shadow-glow hover:opacity-95 transition"
          >
            Continue to checkout →
          </button>
        </div>
      </section>
    </div>
  );
}