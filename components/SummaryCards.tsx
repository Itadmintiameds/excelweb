"use client";

import SummaryCard from "./SummaryCard";

type SummaryCardsProps = {
  reports: any[];
  selectedCard: string;
  setSelectedCard: (value: string) => void;

  currentSheetName?: string;
};

export default function SummaryCards({
  reports,
  selectedCard,
  setSelectedCard,
  currentSheetName,
}: SummaryCardsProps) {

  // Count only the sheet on screen — one page is one day — so the cards match
  // the table below them. On load that is the latest sheet.
  const filteredReports = currentSheetName
    ? reports.filter((report) => report.sheetName === currentSheetName)
    : reports;

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