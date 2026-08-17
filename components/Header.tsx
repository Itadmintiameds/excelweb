import SendEmailButton from "./SendEmailButton";

export default function Header() {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white shadow-md px-8 py-5">

      <div className="flex justify-between items-center">

        {/* Left Section */}
        <div>
          <h1 className="text-3xl font-bold text-violet-700">
            TiaMeds Technology Pvt. Ltd.
          </h1>

          <p className="text-gray-500 mt-1">
            Daily Report Dashboard - test
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">

          <div className="text-right">
            <p className="text-sm text-gray-500">
              Today's Date
            </p>

            <p className="font-semibold">
              {today}
            </p>
          </div>

          <SendEmailButton />

        </div>

      </div>

    </header>
  );
}