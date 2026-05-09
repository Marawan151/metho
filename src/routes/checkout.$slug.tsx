import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { calcTotal, formatPrice } from "@/lib/pricing";

const searchSchema = z.object({
  type: z.enum(["standard", "student", "vip"]).default("standard"),
  qty: z.coerce.number().int().min(1).max(10).default(1),
});

export const Route = createFileRoute("/checkout/$slug")({
  head: () => ({
    meta: [
      { title: "Checkout — Loom" },
      { name: "description", content: "Complete your event ticket purchase." },
    ],
  }),
  validateSearch: searchSchema,
  component: CheckoutPage,
});

function CheckoutPage() {
  const { slug } = Route.useParams();
  const { type, qty } = useSearch({ from: "/checkout/$slug" });
  const { user } = useAuth();
  const nav = useNavigate();

  const [event, setEvent] = useState<Tables<"events"> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promo, setPromo] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("events").select("*").eq("slug", slug).maybeSingle().then(({ data }) => setEvent(data));
  }, [slug]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const totals = calcTotal(type, qty, discountPct);

  async function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (!code) {
      setDiscountPct(0);
      return;
    }
    const { data } = await supabase
      .from("promo_codes")
      .select("discount_pct")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!data) {
      setDiscountPct(0);
      toast.error("Invalid promo code");
    } else {
      setDiscountPct(data.discount_pct);
      toast.success(`${data.discount_pct}% off applied`);
    }
  }

  async function pay() {
    if (!event) return;
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
      })
      .safeParse({ name, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);

    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .insert({
        event_id: event.id,
        full_name: parsed.data.name,
        email: parsed.data.email,
        ticket_type: type,
      })
      .select("id")
      .single();
    if (regErr) {
      setBusy(false);
      toast.error(regErr.message);
      return;
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        event_id: event.id,
        registration_id: reg.id,
        ticket_type: type,
        quantity: qty,
        unit_price_cents: totals.unit,
        promo_code: discountPct > 0 ? promo.trim().toUpperCase() : null,
        discount_pct: discountPct,
        total_cents: totals.total,
        status: "confirmed",
      })
      .select("id")
      .single();
    setBusy(false);
    if (orderErr) {
      toast.error(orderErr.message);
      return;
    }
    nav({ to: `/confirmation/${order.id}` });
  }

  if (!event) return <div className="mx-auto max-w-3xl px-6 py-20 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 grid lg:grid-cols-[1fr_360px] gap-8">
      <section className="space-y-6">
        <h1 className="font-display text-4xl font-bold">Checkout</h1>
        <div className="rounded-2xl bg-card shadow-card ring-border-gradient p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Attendee</h2>
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
        </div>
        <div className="rounded-2xl bg-card shadow-card ring-border-gradient p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold">Promo code</h2>
          <div className="flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="LAUNCH20"
              className="flex-1 rounded-lg bg-input/60 border border-border px-3.5 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <button onClick={applyPromo} className="rounded-lg border border-border px-4 text-sm hover:text-foreground text-muted-foreground">
              Apply
            </button>
          </div>
          {discountPct > 0 && (
            <p className="text-xs text-primary font-mono">{discountPct}% discount applied</p>
          )}
        </div>
      </section>

      <aside className="rounded-2xl bg-card shadow-card ring-border-gradient p-6 h-fit space-y-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Event</div>
          <div className="font-medium">{event.title}</div>
        </div>
        <div className="text-sm space-y-1.5">
          <Row label={`${qty} × ${type}`} value={formatPrice(totals.subtotal)} />
          {discountPct > 0 && (
            <Row label={`Discount (${discountPct}%)`} value={`-${formatPrice(totals.discount)}`} />
          )}
        </div>
        <div className="border-t border-border pt-3 flex items-baseline justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Total</span>
          <span className="text-2xl font-display font-bold">{formatPrice(totals.total)}</span>
        </div>
        <button
          onClick={pay}
          disabled={busy}
          className="w-full rounded-lg bg-gradient-primary text-primary-foreground font-medium py-3 shadow-glow hover:opacity-95 transition disabled:opacity-60"
        >
          {busy ? "Processing…" : "Confirm registration"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Demo checkout — no payment is charged.
        </p>
      </aside>
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
        className="w-full rounded-lg bg-input/60 border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
