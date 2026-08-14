import { fetchAllSheetData } from "@/lib/googleSheets";
import { parseDMY, formatSheetLabel } from "@/lib/dateUtils";

function combineTasks(tasks) {
  const clean = tasks.filter((t) => t && t.trim() !== "");
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return clean
    .map((t, i) => {
      const stripped = t.replace(/^\s*\d+[\.\)]\s*/, "");
      return `${i + 1}. ${stripped}`;
    })
    .join("\n");
}

function dateTabNamesSorted(names) {
  return [...names].sort((a, b) => parseDMY(a) - parseDMY(b));
}

export async function GET() {
  try {
    const scriptResult = await fetchAllSheetData();
    const allTabNames = scriptResult.tabs || [];
    const dateTabNames = allTabNames.filter((name) => parseDMY(name) !== 0);
    const tabsData = scriptResult.data || {};

    const allEmployees = [];

    for (const sheetName of dateTabNames) {
      const data = tabsData[sheetName] || [];

      let lastId = "";
      let lastDate = "";
      let lastResource = "";
      let lastAttendance = "";

      data.forEach((row) => {
        if (row["Sl. No."] !== "") lastId = row["Sl. No."];
        else row["Sl. No."] = lastId;

        if (row["Date"] !== "") lastDate = row["Date"];
        else row["Date"] = lastDate;

        if (row["Resource Name"] !== "") lastResource = row["Resource Name"];
        else row["Resource Name"] = lastResource;

        if (row["Resource Attendance"] !== "") lastAttendance = row["Resource Attendance"];
        else row["Resource Attendance"] = lastAttendance;
      });

      const sheetDateTime = parseDMY(sheetName);
      const sheetFormattedDate = formatSheetLabel(sheetName);
      const isWeekend =
        sheetDateTime !== 0 && [0, 6].includes(new Date(sheetDateTime).getDay());

      const resourceGroups = new Map();

      data.forEach((row, index) => {
        if (
          row["Sl. No."] === "" &&
          row["Resource Name"] === "" &&
          row["Task Details"] === ""
        ) {
          return;
        }

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
        const task = String(row["Task Details"] || "").trim();

        if (!resourceGroups.has(resource)) {
          resourceGroups.set(resource, {
            excelOrder: index,
            id: Number(row["Sl. No."]) || 0,
            resource,
            projects: new Set(),
            tasks: [],
            statuses: new Set(),
            attendance,
          });
        }

        const group = resourceGroups.get(resource);
        if (project) group.projects.add(project);
        if (task) group.tasks.push(task);
        if (status) group.statuses.add(status);
      });

      resourceGroups.forEach((group) => {
        allEmployees.push({
          excelOrder: group.excelOrder,
          sheetName,
          id: group.id,
          date: sheetFormattedDate,
          resource: group.resource,
          project: [...group.projects].join(", "),
          task: combineTasks(group.tasks),
          status: [...group.statuses].join(" / "),
          attendance: group.attendance,
        });
      });
    }

    allEmployees.sort((a, b) => {
      const dateA = parseDMY(a.sheetName);
      const dateB = parseDMY(b.sheetName);
      if (dateA !== dateB) return dateA - dateB;
      return a.excelOrder - b.excelOrder;
    });

    const sheetNames = dateTabNamesSorted(dateTabNames);
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