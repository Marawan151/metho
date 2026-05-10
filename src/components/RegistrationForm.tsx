import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  ticket_type: z.enum(["standard", "student", "vip"]),
  dietary: z.string().trim().max(240).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormState = z.input<typeof schema>;

const initial: FormState = {
  full_name: "",
  email: "",
  company: "",
  role: "",
  ticket_type: "standard",
  dietary: "",
  notes: "",
};

const fieldClass =
  "w-full rounded-lg bg-input/60 border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/60 transition";

const labelClass = "text-xs font-mono uppercase tracking-wider text-muted-foreground";

export function RegistrationForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setSubmitting(true);
    const v = parsed.data;
    const { error } = await supabase.from("registrations").insert({
      event_id: eventId,
      full_name: v.full_name,
      email: v.email,
      company: v.company || null,
      role: v.role || null,
      ticket_type: v.ticket_type,
      dietary: v.dietary || null,
      notes: v.notes || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("This email is already registered for this event.");
      } else {
        toast.error(error.message || "Could not submit registration");
      }
      return;
    }
    setDone(true);
    toast.success(`You're in! See you at ${eventTitle}.`);
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-card shadow-card ring-border-gradient p-8 text-center">
        <div className="text-5xl mb-3">✦</div>
        <h3 className="font-display text-2xl font-bold mb-2">Registration confirmed</h3>
        <p className="text-muted-foreground mb-6">
          A confirmation will be sent to <span className="font-mono text-foreground">{form.email}</span>.
        </p>
        <button
          onClick={() => {
            setForm(initial);
            setDone(false);
          }}
          className="text-sm text-primary hover:underline"
        >
          Register another attendee
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-card shadow-card ring-border-gradient p-6 sm:p-8 space-y-5"
    >
      <div>
        <h3 className="font-display text-2xl font-bold">Reserve your spot</h3>
        <p className="text-sm text-muted-foreground">Free for the first 100 registrants.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className={labelClass}>Full name *</span>
          <input
            className={fieldClass}
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            required
            maxLength={120}
            placeholder="Ada Lovelace"
          />
        </label>
        <label className="block space-y-1.5">
          <span className={labelClass}>Email *</span>
          <input
            className={fieldClass}
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            maxLength={255}
            placeholder="ada@example.com"
          />
        </label>
        <label className="block space-y-1.5">
          <span className={labelClass}>Company</span>
          <input
            className={fieldClass}
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            maxLength={160}
            placeholder="Acme Corp"
          />
        </label>
        <label className="block space-y-1.5">
          <span className={labelClass}>Role</span>
          <input
            className={fieldClass}
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            maxLength={120}
            placeholder="Staff Engineer"
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <span className={labelClass}>Ticket type *</span>
        <div className="grid grid-cols-3 gap-2">
          {(["standard", "student", "vip"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => update("ticket_type", t)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium border transition capitalize ${
                form.ticket_type === t
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "bg-input/40 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className={labelClass}>Dietary preferences</span>
        <input
          className={fieldClass}
          value={form.dietary}
          onChange={(e) => update("dietary", e.target.value)}
          maxLength={240}
          placeholder="Vegan, gluten-free, none…"
        />
      </label>

      <label className="block space-y-1.5">
        <span className={labelClass}>Anything else?</span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          maxLength={1000}
          placeholder="Accessibility needs, talk requests, etc."
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gradient-primary text-primary-foreground font-medium py-3 shadow-glow hover:opacity-95 transition disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Register"}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        We'll only use your email to send event details. No spam, ever.
      </p>
    </form>
  );
}
// METHO-15: Registration form component 
// METHO-15: Registration form component 
