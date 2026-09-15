// Company holiday calendar. Update this once a year when HR publishes the new
// list — nothing else needs to change.
//
// Dates are IST calendar dates in ISO form ("YYYY-MM-DD"). Keep them sorted;
// the trailing comment is only for humans reading the file.
export const COMPANY_HOLIDAYS = [
  // --- 2026 ---
  "2026-01-01", // Thu — New Year
  "2026-01-15", // Thu — Makara Sankranti
  "2026-01-26", // Mon — Republic Day
  "2026-03-19", // Thu — Ugadi
  "2026-03-21", // Sat — Eid al Fitr / Ramzan (subject to sighting of the moon)
  "2026-05-01", // Fri — May Day
  "2026-05-28", // Thu — Bakrid / Eid al Adha (subject to sighting of the moon)
  "2026-08-15", // Sat — Independence Day
  "2026-08-26", // Wed — Eid Milad
  "2026-08-28", // Fri — Vara Mahalakshmi
  "2026-09-14", // Mon — Ganesh Chaturthi
  "2026-10-02", // Fri — Gandhi Jayanti
  "2026-10-20", // Tue — Ayudha Pooja
  "2026-10-21", // Wed — Vijaya Dashami
  "2026-11-10", // Tue — Deepavali
  "2026-12-25", // Fri — Christmas
];

// Set of just the date strings, for O(1) lookups.
const HOLIDAY_DATES = new Set(COMPANY_HOLIDAYS);

// The daily report is a working-day report, so everything below is anchored to
// IST regardless of which region the server actually runs in.
const IST_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

// Returns { date: "2026-09-15", weekday: "Tue" } for the given instant in IST.
function istParts(when = new Date()) {
  const parts = IST_PARTS.formatToParts(when);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"),
  };
}

// The IST calendar date ("YYYY-MM-DD") at the given instant.
export function istDateString(when = new Date()) {
  return istParts(when).date;
}

export function isWeekend(when = new Date()) {
  const { weekday } = istParts(when);
  return weekday === "Sat" || weekday === "Sun";
}

export function isCompanyHoliday(when = new Date()) {
  return HOLIDAY_DATES.has(istParts(when).date);
}

// A day we don't send the daily report on: Saturday, Sunday, or a company
// holiday. Returns null when the report should go out, otherwise a reason
// string suitable for logging / the cron response body.
export function nonWorkingDayReason(when = new Date()) {
  const { date, weekday } = istParts(when);
  if (HOLIDAY_DATES.has(date)) return `company holiday (${date})`;
  if (weekday === "Sat" || weekday === "Sun") return `weekend (${weekday} ${date})`;
  return null;
}

export function isWorkingDay(when = new Date()) {
  return nonWorkingDayReason(when) === null;
}
