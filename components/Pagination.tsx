type DateOption = { page: number; label: string };

type PaginationProps = {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  recordsOnPage: number;
  currentDateLabel?: string;
  dateOptions: DateOption[];
};

export default function Pagination({
  currentPage,
  setCurrentPage,
  totalPages,
  recordsOnPage,
  currentDateLabel,
  dateOptions,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4 mt-6">
      <p className="text-sm text-gray-600">
        Showing <b>{recordsOnPage}</b> report{recordsOnPage === 1 ? "" : "s"}
        {currentDateLabel ? (
          <>
            {" for "}
            <b>{currentDateLabel}</b>
          </>
        ) : null}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          ← Previous
        </button>

        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          {dateOptions.map((opt) => (
            <option key={opt.page} value={opt.page}>
              {opt.label} — Page {opt.page} of {safeTotalPages}
            </option>
          ))}
        </select>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}