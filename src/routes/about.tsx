import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Loom — Tech events for people who ship" },
      {
        name: "description",
        content:
          "Loom is a curated calendar of tech conferences and workshops. We help engineers find events worth showing up to.",
      },
    ],
  }),
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-xs font-mono uppercase tracking-widest text-primary-glow mb-3">
        About Loom
      </p>
      <h1 className="font-display text-5xl font-extrabold tracking-tight">
        We curate events worth <span className="text-gradient-primary">showing up to</span>.
      </h1>
      <div className="mt-8 space-y-5 text-lg text-muted-foreground leading-relaxed">
        <p>
          There are too many tech conferences and not enough time. Loom is a small,
          opinionated calendar of the events we'd actually fly across an ocean for —
          deep-technical conferences, intensive workshops, and gatherings of people
          who actually ship things.
        </p>
        <p>
          Every event on Loom is hand-picked. Registration is one form, no accounts,
          no upsells. Show up, learn something, meet someone, ship better.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-3 gap-6">
        {[
          ["Curated", "Hand-picked events. No filler, no vendor pitches."],
          ["Honest", "Real capacity, real speakers, real talk descriptions."],
          ["Fast", "Register in 30 seconds. No account required."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-card ring-border-gradient p-6 shadow-card">
            <h3 className="font-display text-xl font-bold mb-1">{t}</h3>
            <p className="text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <Link
          to="/"
          className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-95 transition"
        >
          See upcoming events →
        </Link>
      </div>
    </div>
  );
}
