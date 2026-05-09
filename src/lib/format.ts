export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const sameDay = s.toDateString() === e.toDateString();
  const dOpts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  const tOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  if (sameDay) {
    return `${s.toLocaleDateString("en-US", dOpts)} · ${s.toLocaleTimeString("en-US", tOpts)} – ${e.toLocaleTimeString("en-US", tOpts)}`;
  }
  return `${s.toLocaleDateString("en-US", dOpts)} → ${e.toLocaleDateString("en-US", dOpts)}`;
}
