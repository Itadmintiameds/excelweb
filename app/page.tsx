"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import ReportTable from "../components/ReportTable";
import Pagination from "../components/Pagination";
import { formatSheetLabel } from "@/lib/dateUtils";

export default function Home() {

  const [reports, setReports] = useState<any[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCard, setSelectedCard] = useState("Total Reports");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsOnPage, setRecordsOnPage] = useState(0);

  useEffect(() => {

    const fetchReports = async () => {

      try {
        const response = await fetch("/api/excel-data");
        const result = await response.json();

        const allReports = result.data || [];
        const names = result.sheetNames || [];

        setReports(allReports);
        setSheetNames(names);
      }

      catch (error) {
        console.error("Failed to fetch reports:", error);
      }

    };
    fetchReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, attendanceFilter, selectedCard]);

  const handleDateFilterChange = (isoDate: string) => {
    setDateFilter(isoDate);

    if (!isoDate) return;

    const [year, month, day] = isoDate.split("-");
    const matchIndex = sheetNames.findIndex((name) => {
      const label = formatSheetLabel(name);
      return label === `${day}-${month}-${year}`;
    });

    if (matchIndex !== -1) {
      setCurrentPage(matchIndex + 1);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setAttendanceFilter("All");
    setDateFilter("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, sheetNames.length);
  const currentDateLabel = sheetNames[currentPage - 1]
    ? formatSheetLabel(sheetNames[currentPage - 1])
    : undefined;

  const dateOptions = sheetNames.map((name, i) => ({
    page: i + 1,
    label: formatSheetLabel(name),
  }));

  return (

    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SummaryCards
        reports={reports}
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        dateFilter={dateFilter}
        />

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          attendanceFilter={attendanceFilter}
          setAttendanceFilter={setAttendanceFilter}
          dateFilter={dateFilter}
          setDateFilter={handleDateFilterChange}
          resetFilters={resetFilters}
        />

        <ReportTable
          reports={reports}
          sheetNames={sheetNames}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          attendanceFilter={attendanceFilter}
          selectedCard={selectedCard}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          currentPage={currentPage}
          setRecordsOnPage={setRecordsOnPage}
        />

        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          recordsOnPage={recordsOnPage}
          currentDateLabel={currentDateLabel}
          dateOptions={dateOptions}
        />

      </div>
    </main>
  );
}