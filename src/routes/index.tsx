import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "@/components/EventCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Loom — Tech events for people who ship" },
      {
        name: "description",
        content:
          "Curated conferences, summits and workshops for engineers. Browse upcoming events and register in seconds.",
      },
    ],
  }),
});

function Index() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const featured = events?.filter((e) => e.featured) ?? [];
  const rest = events?.filter((e) => !e.featured) ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-3 py-1 text-xs font-mono text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse" />
            2026 season · registration open
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight max-w-3xl">
            Tech events for the people who <span className="text-gradient-primary">build the web</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Loom curates conferences, summits, and hands-on workshops for engineers,
            designers, and founders. Find your crowd. Reserve a seat in 30 seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#events"
              className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-95 transition"
            >
              Browse events
            </a>
            <Link
              to="/about"
              className="inline-flex items-center px-5 py-3 rounded-lg border border-border bg-card/40 backdrop-blur hover:bg-card transition"
            >
              About Loom
            </Link>
          </div>

          <dl className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
            {[
              ["12K+", "attendees"],
              ["48", "events / yr"],
              ["230", "speakers"],
              ["19", "cities"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-bold text-gradient-primary">{n}</dt>
                <dd className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section id="events" className="mx-auto max-w-6xl px-6 py-16 scroll-mt-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-primary-glow mb-2">
                Featured
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Don't miss these</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {featured.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* All */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-primary-glow mb-2">
              All upcoming
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">The full calendar</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl bg-card animate-pulse ring-border-gradient"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}

        {!isLoading && events && events.length === 0 && (
          <p className="text-muted-foreground text-center py-16">
            No events scheduled yet. Check back soon.
          </p>
        )}
      </section>
    </>
  );
}
