export const MONTH_NAMES = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

// Parses D-M-YY, D-M-YYYY, or D-MonAbbrev-YYYY (e.g. "03-Jul-2026")
// into a timestamp. 2-digit years are treated as 20xx. Returns 0 on failure.
export function parseDMY(dateStr) {
  const parts = String(dateStr).trim().split(/[-/\s]+/).filter(Boolean);
  if (parts.length !== 3) return 0;

  const [dPart, mPart, yPart] = parts;
  const day = parseInt(dPart, 10);

  let month;
  if (/^\d+$/.test(mPart)) {
    month = parseInt(mPart, 10);
  } else {
    const key = mPart.toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
    month = MONTH_NAMES[key];
  }

  let year = parseInt(yPart, 10);

  if (!day || !month || !year || isNaN(day) || isNaN(year)) return 0;
  if (year < 100) year += 2000;

  return new Date(year, month - 1, day).getTime();
}

// Formats any parseable raw sheet name into a clean DD-MM-YYYY label.
// Falls back to the raw string if it can't be parsed.
export function formatSheetLabel(rawSheetName) {
  const ts = parseDMY(rawSheetName);
  if (!ts) return rawSheetName;
  const date = new Date(ts);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Converts an <input type="date"> ISO value ("2026-07-03") to "03-07-2026".
export function isoToDMY(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}