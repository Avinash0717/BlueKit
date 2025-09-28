"use client";

import { useState, useEffect } from "react";
import { CloudUpload, File as FileIcon, CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react"; // install lucide-react for icons

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setNotification({ type: "warning", message: "Please select a file before uploading." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // field name must be "file" (matches Django)

    try {
      const response = await fetch("http://localhost:8000/remove-comments/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Since backend returns file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "cleaned_" + file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setNotification({ type: "success", message: `File cleaned and ready to download: cleaned_${file.name}` });
    } catch (error) {
      console.error("Error:", error);
      setNotification({ type: "error", message: "Something went wrong while uploading." });
    }

    setFile(null); // Reset after upload
    
  };

  // Auto-hide notifications after 3s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-lg border-r border-gray-700 hidden md:flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">⚡ Blue Pick</h2>
        <nav className="space-y-4">
          <a className="block py-2 px-4 rounded-lg bg-blue-600 text-white font-medium">
            Comment Remover
          </a>
          <a className="block py-2 px-4 rounded-lg hover:bg-gray-700 transition">
            Coming Soon
          </a>
        </nav>
        <div className="mt-auto text-sm text-gray-400">© 2025 Blue Kit</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Comment Removing Tool
          </h1>
          <p className="mt-3 text-gray-300 text-lg">
            Upload your file securely and get started
          </p>
        </header>

        {/* Upload card */}
        <section className="w-full max-w-xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drop Zone */}
            <label
              htmlFor="fileInput"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-xl cursor-pointer hover:border-blue-500 transition group"
            >
              <CloudUpload className="w-14 h-14 text-gray-400 group-hover:text-blue-400 transition mb-3" />
              <p className="text-gray-300 group-hover:text-white transition">
                {file ? (
                  <span className="flex items-center gap-2">
                    <FileIcon className="w-5 h-5 text-blue-400" />
                    {file.name}
                  </span>
                ) : (
                  "Drag & drop your file here, or click to browse"
                )}
              </p>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Upload Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold hover:opacity-90 transition"
            >
              Upload File
            </button>
          </form>
        </section>
      </main>

{/* Fancy Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 flex items-start gap-3 px-5 py-4 rounded-lg backdrop-blur-xl border shadow-2xl animate-fade-up overflow-hidden group
          ${
            notification.type === "success"
              ? "bg-green-500/20 border-green-400/30"
              : notification.type === "error"
              ? "bg-red-500/20 border-red-400/30"
              : "bg-red-500/20 border-red-400/30"
          }`}
        >
          {/* Glow ring */}
          <div
            className={`w-2 h-2 mt-2 rounded-full animate-pulse
            ${
              notification.type === "success"
                ? "bg-green-400 shadow-[0_0_15px_3px_rgba(34,197,94,0.7)]"
                : notification.type === "error"
                ? "bg-red-400 shadow-[0_0_15px_3px_rgba(239,68,68,0.7)]"
                : "bg-red-300 shadow-[0_0_15px_3px_rgba(239,68,68,0.7)]"
            }`}
          ></div>

          {/* Icon + message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              {notification.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
              {notification.type === "error" && (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              {notification.type === "warning" && (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span>{notification.message}</span>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-700 to-gray-500 animate-progress w-full"></div>
          </div>

          {/* Close button */}
          <button
            className="ml-3 opacity-70 hover:opacity-100"
            onClick={() => setNotification(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeUp {
          0% {
            transform: translateY(30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s ease-out;
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
}