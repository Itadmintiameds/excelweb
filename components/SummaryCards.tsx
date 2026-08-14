"use client";

import SummaryCard from "./SummaryCard";
import { formatSheetLabel, isoToDMY } from "@/lib/dateUtils";

type SummaryCardsProps = {
  reports: any[];
  selectedCard: string;
  setSelectedCard: (value: string) => void;

  dateFilter: string;
};

export default function SummaryCards({
  reports,
  selectedCard,
  setSelectedCard,
  dateFilter,
}: SummaryCardsProps) {

  // Show reports for selected date only
  const filteredReports =
    dateFilter === ""
      ? reports
      : reports.filter(
          (report) => formatSheetLabel(report.sheetName) === isoToDMY(dateFilter)
        );

  const cards = [
    {
      title: "Total Reports",
      count: filteredReports.length,
    },
    {
      title: "Completed",
      count: filteredReports.filter(
        (report) =>
          report.status?.toLowerCase() === "completed"
      ).length,
    },
    {
      title: "In Progress",
      count: filteredReports.filter(
        (report) =>
          report.status?.toLowerCase() === "in progress"
      ).length,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {cards.map((card) => (
        <SummaryCard
          key={card.title}
          title={card.title}
          count={card.count}
          active={selectedCard === card.title}
          onClick={() => setSelectedCard(card.title)}
        />
      ))}
    </div>
  );
}