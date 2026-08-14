export async function fetchAllSheetData() {
  const res = await fetch(process.env.APPS_SCRIPT_URL);
  if (!res.ok) {
    throw new Error(`Apps Script fetch failed: ${res.status}`);
  }
  return res.json();
}