const hydrationDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const hydrationDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

export function formatHydrationSafeDate(date: Date): string {
  return hydrationDateFormatter.format(date);
}

export function formatHydrationSafeDateTime(date: Date): string {
  return hydrationDateTimeFormatter.format(date);
}
