"use client";

import { useState } from "react";
import axios from "axios";

type Status = "idle" | "sending" | "success" | "error";

export default function SendEmailButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const closeModal = () => {
    setIsOpen(false);
    setPasscode("");
    setStatus("idle");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("sending");
    setMessage("");

    try {
      await axios.post("/api/send-daily-email", { passcode });
      setStatus("success");
      setMessage("Email sent successfully.");
      setPasscode("");
    } catch (error) {
      setStatus("error");

      const serverError =
        axios.isAxiosError(error) && error.response?.data?.error;

      setMessage(serverError || "Failed to send email. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg transition"
      >
        Send Email Now
      </button>

      {isOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          {/* Stop backdrop clicks from closing the modal when they land inside it */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-violet-700">
              Send Daily Report Email
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This emails the dashboard link to all configured recipients.
            </p>

            <form onSubmit={handleSubmit} className="mt-4">
              <label
                htmlFor="manual-send-passcode"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Passcode
              </label>

              <input
                id="manual-send-passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                disabled={status === "sending"}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
              />

              {message && (
                <p
                  className={`mt-3 text-sm font-medium ${
                    status === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  {status === "success" ? "Close" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={status === "sending" || passcode.trim() === ""}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:hover:bg-violet-600"
                >
                  {status === "sending" ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
