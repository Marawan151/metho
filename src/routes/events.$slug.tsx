import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationForm } from "@/components/RegistrationForm";
import { formatEventRange } from "@/lib/format";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetail,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Couldn't load this event</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-gradient-primary text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  },
  notFoundComponent: () => {
    const { slug } = Route.useParams();
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Event not found</h1>
        <p className="text-muted-foreground mt-2 text-sm font-mono">/events/{slug}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-gradient-primary text-primary-foreground"
        >
          Back to events
        </Link>
      </div>
    );
  },
});

function EventDetail() {
  const { slug } = Route.useParams();
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading || !event) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="h-72 rounded-3xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1 mb-8"
      >
        ← All events
      </Link>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14">
        <div>
          <div className="relative aspect-[16/9] rounded-3xl bg-gradient-hero ring-border-gradient flex items-center justify-center overflow-hidden mb-8 shadow-card">
            <span className="text-9xl drop-shadow-[0_10px_50px_rgba(79,70,229,0.7)]">
              {event.cover_emoji}
            </span>
            <div className="absolute top-4 left-4 flex gap-2">
              {event.featured && (
                <span className="text-[10px] uppercase tracking-widest font-mono px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                  Featured
                </span>
              )}
              <span className="text-[10px] uppercase tracking-widest font-mono px-2.5 py-1 rounded-full bg-background/60 backdrop-blur border border-border">
                {event.format}
              </span>
            </div>
          </div>

          <p className="text-xs font-mono uppercase tracking-widest text-primary-glow mb-3">
            {formatEventRange(event.starts_at, event.ends_at)}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
            {event.title}
          </h1>
          <p className="text-xl text-muted-foreground mt-3">{event.tagline}</p>

          <dl className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["Location", event.location],
              ["Format", event.format],
              ["Capacity", `${event.capacity} attendees`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-card p-4 ring-border-gradient">
                <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-1 font-medium capitalize">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 prose-invert">
            <h2 className="font-display text-2xl font-bold mb-3">About this event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RegistrationForm eventId={event.id} eventTitle={event.title} />
        </aside>
      </div>
    </article>
  );
}
