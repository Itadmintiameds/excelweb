import { fetchAllSheetData } from "@/lib/googleSheets";
import { parseDMY, formatSheetLabel } from "@/lib/dateUtils";

// Task cells often carry their own numbering ("1)Implemented print ..."). Each
// task is its own table row now, so that prefix is redundant.
function stripTaskNumber(task) {
  return task.replace(/^\s*\d+[\.\)]\s*/, "");
}

function dateTabNamesSorted(names) {
  return [...names].sort((a, b) => parseDMY(a) - parseDMY(b));
}

export async function GET() {
  try {
    const scriptResult = await fetchAllSheetData();
    const allTabNames = scriptResult.tabs || [];
    // Do not filter out tabs if their name isn't a date (e.g. "Sheet1 (1)")
    const dateTabNames = allTabNames;
    const tabsData = scriptResult.data || {};

    const allEmployees = [];
    const effectiveSheetNamesSet = new Set();

    for (const sheetName of dateTabNames) {
      const data = tabsData[sheetName] || [];

      // A row that is entirely empty in the sheet is spacing, not data. This
      // has to be decided before the forward-fill below, which would otherwise
      // inherit values from the row above and turn it into a phantom record.
      const isBlankRow = data.map((row) =>
        Object.values(row).every((value) => String(value ?? "").trim() === "")
      );

      let lastId = "";
      let lastDate = "";
      let lastResource = "";
      let lastProject = "";
      let lastAttendance = "";

      data.forEach((row) => {
        if (row["Sl. No."] !== "") lastId = row["Sl. No."];
        else row["Sl. No."] = lastId;

        if (row["Date"] !== "") lastDate = row["Date"];
        else row["Date"] = lastDate;

        if (row["Resource Name"] !== "") lastResource = row["Resource Name"];
        else row["Resource Name"] = lastResource;

        // Project Name is a merged cell spanning a resource's task rows, so it
        // has to be filled down too or every task after the first loses it.
        if (row["Project Name"] !== "") lastProject = row["Project Name"];
        else row["Project Name"] = lastProject;

        if (row["Resource Attendance"] !== "") lastAttendance = row["Resource Attendance"];
        else row["Resource Attendance"] = lastAttendance;
      });

      let sheetDateTime = parseDMY(sheetName);
      let sheetFormattedDate = formatSheetLabel(sheetName);
      let effectiveSheetName = sheetName;

      // Fallback: if sheet name isn't a date, use the date from the rows
      if (sheetDateTime === 0 && lastDate) {
        effectiveSheetName = formatSheetLabel(lastDate);
        sheetDateTime = parseDMY(lastDate);
        sheetFormattedDate = effectiveSheetName;
      }

      effectiveSheetNamesSet.add(effectiveSheetName);

      const isWeekend =
        sheetDateTime !== 0 && [0, 6].includes(new Date(sheetDateTime).getDay());

      data.forEach((row, index) => {
        if (isBlankRow[index]) return;

        let status = String(row["Status"] || "").trim();
        if (status.toLowerCase().includes("completed")) {
          status = "Completed";
        } else if (status.toLowerCase().includes("progress")) {
          status = "In Progress";
        } else if (status.toLowerCase().includes("review")) {
          status = "Submitted for Review";
        }

        let attendance = String(row["Resource Attendance"] || "").trim();
        if (isWeekend) attendance = "Week Off";

        const resource = String(row["Resource Name"] || "").trim();
        const project = String(row["Project Name"] || "").trim();
        const task = stripTaskNumber(String(row["Task Details"] || "").trim());

        // Sheets are often pre-filled with names and Sl. No. before anyone has
        // logged work, and some rows carry only a date. Neither is a report, so
        // require at least one of task / status / attendance to be present.
        if (!task && !status && !attendance) return;

        // One record per sheet row, so every task keeps its own status instead
        // of being collapsed into a combined "Completed / In Progress" badge.
        allEmployees.push({
          excelOrder: index,
          sheetName: effectiveSheetName,
          id: Number(row["Sl. No."]) || 0,
          date: sheetFormattedDate,
          resource,
          project,
          task,
          status,
          attendance,
        });
      });
    }

    allEmployees.sort((a, b) => {
      const dateA = parseDMY(a.sheetName);
      const dateB = parseDMY(b.sheetName);
      if (dateA !== dateB) return dateA - dateB;
      return a.excelOrder - b.excelOrder;
    });

    const sheetNames = dateTabNamesSorted(Array.from(effectiveSheetNamesSet));
    const latestSheet = sheetNames[sheetNames.length - 1];

    return Response.json({
      success: true,
      latestSheet,
      sheetNames,
      data: allEmployees,
      rowCount: allEmployees.length,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
