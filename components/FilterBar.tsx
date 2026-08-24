"use client";

type FilterBarProps = {
  statusFilter: string;
  setStatusFilter: (value: string) => void;

  attendanceFilter: string;
  setAttendanceFilter: (value: string) => void;

  dateFilter: string;
  setDateFilter: (value: string) => void;

  resetFilters: () => void;
};

export default function FilterBar({
  statusFilter,
  setStatusFilter,

  attendanceFilter,
  setAttendanceFilter,

  dateFilter,
  setDateFilter,

  resetFilters,

}: FilterBarProps) {

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6">
      <div className="flex flex-wrap gap-4 items-center">


        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
        </select>

        {/* Attendance */}
        <select
          value={attendanceFilter}
          onChange={(e) => setAttendanceFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="All">All Attendance</option>
          <option value="Present">Present</option>
          <option value="Week Off">Week Off</option>
          <option value="Absent">Absent</option>
          

        </select>

        {/* Date */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}