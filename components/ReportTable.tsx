import { useEffect } from "react";
import StatusBadge from "./StatusBadge";
import { parseDMY, formatSheetLabel } from "@/lib/dateUtils";

type ReportTableProps = {
  reports: any[];
  sheetNames: string[];

  searchTerm: string;
  statusFilter: string;
  attendanceFilter: string;

  selectedCard: string;

  currentPage: number;
  setRecordsOnPage: (value: number) => void;

  sortBy: string;
  setSortBy: (value: string) => void;

  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
};

// Parses a report.date string (DD-MM-YYYY or raw sheet name) for chronological sort.
function parseDate(dateStr: string): Date {
  const ts = parseDMY(dateStr);
  return ts ? new Date(ts) : new Date(0);
}

function normalizeStatus(status: string): string {
  return status
    .split("/")
    .map((s) => s.trim().toLowerCase())
    .sort()
    .join(" / ");
}

export default function ReportTable({
  reports,
  sheetNames,
  searchTerm,
  statusFilter,
  attendanceFilter,
  selectedCard,
  currentPage,
  setRecordsOnPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: ReportTableProps) {

  const filteredReports = reports.filter((report) => {

    const matchesSearch =
      report.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.task?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
    statusFilter === "All" ||
    normalizeStatus(report.status || "") === normalizeStatus(statusFilter);

    const matchesAttendance =
      attendanceFilter === "All" ||
      report.attendance?.trim().toLowerCase() === attendanceFilter.toLowerCase();

    const matchesCard =
      selectedCard === "Total Reports" ||
      report.status?.toLowerCase() === selectedCard.toLowerCase();

    return matchesSearch && matchesStatus && matchesAttendance && matchesCard;
  });

  const sortedReports = [...filteredReports];

  if (sortBy !== "") {
    sortedReports.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return sortOrder === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      const valueA = String(a[sortBy] ?? "").toLowerCase();
      const valueB = String(b[sortBy] ?? "").toLowerCase();

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const isSearching = searchTerm.trim() !== "";
  const currentSheetName = sheetNames[currentPage - 1];

  const currentRecords = isSearching
    ? sortedReports
    : currentSheetName
    ? sortedReports.filter((r) => r.sheetName === currentSheetName)
    : sortedReports;

  useEffect(() => {
    setRecordsOnPage(currentRecords.length);
  }, [currentRecords, setRecordsOnPage]);

  // Consecutive rows for the same resource on the same date are the task rows of
  // one merged block in the sheet. Re-merge their Sl.No / Date / Resource /
  // Project cells with rowSpan so the name is not repeated for every task. Only
  // adjacent rows merge, so sorting by another column safely un-merges them.
  const rowMeta = currentRecords.map((report, index) => {
    const previous = currentRecords[index - 1];
    const startsBlock =
      !previous ||
      previous.resource !== report.resource ||
      previous.sheetName !== report.sheetName;
    return { startsBlock, span: 1, serial: 0, block: 0 };
  });

  let blockCount = 0;
  rowMeta.forEach((meta, index) => {
    if (meta.startsBlock) {
      blockCount += 1;
      meta.serial = blockCount;
      let span = 1;
      while (index + span < rowMeta.length && !rowMeta[index + span].startsBlock) {
        span += 1;
      }
      meta.span = span;
    }
    meta.block = blockCount;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-white m-6 p-6 rounded-lg shadow-lg">

      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-violet-700">
            Daily Report List
          </h2>
          <p className="text-gray-500 text-sm">
            Employee Daily Work Report
            {isSearching
              ? ` — Search results for "${searchTerm}"`
              : currentSheetName
              ? ` — ${formatSheetLabel(currentSheetName)}`
              : ""}
          </p>
        </div>

        <div className="bg-violet-100 text-violet-700 px-4 py-2 rounded-lg font-semibold">
          Total : {sortedReports.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-violet-600 text-white">
            <tr>
              <th className="border p-3">Sl.No</th>
              <th onClick={() => handleSort("date")} className="border p-3 cursor-pointer hover:bg-violet-700">
                Date {sortBy === "date" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("resource")} className="border p-3 cursor-pointer hover:bg-violet-700">
                Resource {sortBy === "resource" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("project")} className="border p-3 cursor-pointer hover:bg-violet-700">
                Project {sortBy === "project" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="border p-3">Task Details</th>
              <th onClick={() => handleSort("status")} className="border p-3 cursor-pointer hover:bg-violet-700">
                Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("attendance")} className="border p-3 cursor-pointer hover:bg-violet-700">
                Attendance {sortBy === "attendance" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>

          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((report, index) => (
                <tr
                  key={`${report.sheetName}-${report.resource}-${index}`}
                  className={`transition hover:bg-violet-50 ${
                    rowMeta[index].block % 2 === 1 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {rowMeta[index].startsBlock && (
                    <>
                      <td rowSpan={rowMeta[index].span} className="border p-3 text-center align-middle">
                        {rowMeta[index].serial}
                      </td>
                      <td rowSpan={rowMeta[index].span} className="border p-3 text-center align-middle">
                        {report.date}
                      </td>
                      <td rowSpan={rowMeta[index].span} className="border p-3 text-center align-middle">
                        {report.resource}
                      </td>
                      <td rowSpan={rowMeta[index].span} className="border p-3 text-center align-middle">
                        {report.project}
                      </td>
                    </>
                  )}
                  <td className="border p-3 whitespace-pre-line">{report.task}</td>
                  <td className="border p-3 text-center">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="border p-3 text-center">
                    <span
                      className={`font-semibold ${
                        report.attendance === "Present"
                          ? "text-green-600"
                          : report.attendance === "Week Off"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {report.attendance}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No Reports Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}