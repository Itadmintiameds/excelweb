type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isCombined = status?.includes("/");

  const styles: Record<string, string> = {
    "completed": "bg-green-100 text-green-700",
    "in progress": "bg-yellow-100 text-yellow-700",
    "submitted for review": "bg-blue-100 text-blue-700",
  };

  const style = isCombined
    ? "bg-pink-100 text-pink-700"
    : styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}