type SummaryCardProps = {
  title: string;
  count: number;
  active: boolean;
  onClick: () => void;
};

export default function SummaryCard({
  title,
  count,
  active,
  onClick,
}: SummaryCardProps) {

  let activeStyle =
    "border-violet-500 bg-violet-50 text-violet-700";

  if (title === "Completed") {
    activeStyle =
      "border-green-500 bg-green-50 text-green-700";
  }

  if (title === "In Progress") {
    activeStyle =
      "border-yellow-500 bg-yellow-50 text-yellow-700";
  }

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer
        rounded-xl
        border-2
        p-6
        transition-all
        duration-300
        hover:shadow-lg
        hover:-translate-y-1
        ${
          active
            ? activeStyle
            : "border-gray-200 bg-white text-gray-800 hover:border-violet-300"
        }
      `}
    >
      <p className="text-sm font-medium">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {count}
      </h2>
    </div>
  );
}