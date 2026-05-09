export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-lg">Loom</p>
          <p className="text-sm text-muted-foreground">
            Tech events for people who ship.
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} Loom Events · built with care
        </p>
      </div>
    </footer>
  );
}
