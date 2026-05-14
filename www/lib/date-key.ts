const dayMs = 24 * 60 * 60 * 1000;

export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(date);
}

function dateWindowStart(now: Date, windowDays: number): Date {
  return new Date(now.getTime() - windowDays * dayMs);
}

function dateWindowEnd(now: Date, windowDays: number): Date {
  return new Date(now.getTime() + windowDays * dayMs);
}

export function dateIsInWindow({
  date,
  now,
  timeZone,
  windowDays,
}: {
  date: Date;
  now: Date;
  timeZone: string;
  windowDays: number;
}): boolean {
  const startKey = dateKeyInTimeZone(dateWindowStart(now, windowDays), timeZone);
  const endKey = dateKeyInTimeZone(dateWindowEnd(now, windowDays), timeZone);
  const dateKey = dateKeyInTimeZone(date, timeZone);
  return startKey <= dateKey && dateKey <= endKey;
}
