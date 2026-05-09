import { Link } from "@tanstack/react-router";
import type { Tables } from "@/integrations/supabase/types";
import { formatEventDate } from "@/lib/format";

type Event = Tables<"events">;

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to="/events/$slug"
      params={{ slug: event.slug }}
      className="group relative block rounded-2xl bg-card shadow-card ring-border-gradient overflow-hidden hover:-translate-y-0.5 transition-transform"
    >
      <div className="relative aspect-[16/9] bg-gradient-hero flex items-center justify-center">
        <span className="text-7xl drop-shadow-[0_8px_30px_rgba(79,70,229,0.6)]" aria-hidden>
          {event.cover_emoji}
        </span>
        <div className="absolute top-3 left-3 flex gap-2">
          {event.featured && (
            <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-1 rounded-full bg-primary text-primary-foreground">
              Featured
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-1 rounded-full bg-background/60 backdrop-blur border border-border">
            {event.format}
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-mono text-muted-foreground mb-2">
          {formatEventDate(event.starts_at)} · {event.location}
        </p>
        <h3 className="font-display text-xl font-bold mb-1 group-hover:text-gradient-primary">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{event.tagline}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            cap. {event.capacity}
          </span>
          <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
            Register →
          </span>
        </div>
      </div>
    </Link>
  );
}
