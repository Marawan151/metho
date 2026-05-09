import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow grid place-items-center font-display font-bold text-primary-foreground">
            ◊
          </span>
          <span className="font-display font-bold text-lg tracking-tight">Loom</span>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">/events</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: "px-3 py-2 rounded-md text-foreground font-medium" }}
          >
            Events
          </Link>
          <Link
            to="/about"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: "px-3 py-2 rounded-md text-foreground font-medium" }}
          >
            About
          </Link>
          <a
            href="#events"
            className="ml-2 hidden sm:inline-flex items-center px-4 py-2 rounded-md bg-gradient-primary text-primary-foreground font-medium text-sm shadow-glow hover:opacity-95 transition-opacity"
          >
            Browse events
          </a>
        </nav>
      </div>
    </header>
  );
}
