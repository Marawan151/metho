import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventCard } from "@/components/EventCard";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "All events — Loom" },
      { name: "description", content: "Browse all upcoming tech conferences, summits, and workshops." },
    ],
  }),
  component: EventsListPage,
});

type Event = Tables<"events">;

function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [q, setQ] = useState("");
  const [format, setFormat] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true })
      .then(({ data }) => setEvents((data as Event[]) ?? []));
  }, []);

  const filtered = events.filter((e) => {
    if (format !== "all" && e.format !== format) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      e.title.toLowerCase().includes(s) ||
      e.tagline.toLowerCase().includes(s) ||
      e.location.toLowerCase().includes(s)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-5xl font-bold mb-3">All events</h1>
      <p className="text-muted-foreground mb-8">Tech conferences, summits, and workshops.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, location…"
          className="flex-1 rounded-lg bg-input/60 border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <div className="flex gap-2">
          {(["all", "in-person", "virtual"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition capitalize ${
                format === f
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No events match your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
