"use client";

import { useState, useRef } from "react";

export default function PromptPolisher() {
  const [messyIdea, setMessyIdea] = useState("");
  const [polishedPrompt, setPolishedPrompt] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);
  // This is the new state for the button toggle
  const [showHistory, setShowHistory] = useState(false);

  const handlePolish = async () => {
    setHasResult(false);
    setPolishedPrompt("");

    try {
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messyIdea }),
      });

      const data = await response.json();

      if (data.polished) {
        setPolishedPrompt(data.polished);
        setHasResult(true);
        // Adds the new result to history
        setHistory((prev) => [
          { original: messyIdea, polished: data.polished },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8">AI Prompt Polisher</h1>

      <textarea
        className="w-full max-w-2xl p-4 bg-gray-900 border border-gray-800 rounded-xl mb-4 h-32 focus:outline-none focus:border-blue-500"
        placeholder="Paste your messy idea here..."
        value={messyIdea}
        onChange={(e) => setMessyIdea(e.target.value)}
      />

      <button
        onClick={handlePolish}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all"
      >
        Polish Prompt
      </button>

      {hasResult && (
        <div className="mt-8 w-full max-w-2xl p-6 bg-gray-900 border border-blue-500 rounded-xl">
          <h2 className="text-blue-500 font-bold mb-2 uppercase text-xs">Polished Result</h2>
          <p className="text-lg">{polishedPrompt}</p>
        </div>
      )}

      {/* --- HISTORY SECTION --- */}
      {history.length > 0 && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-12 px-6 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm text-gray-400 transition-all"
          >
            {showHistory ? "Hide History" : "Show History"}
          </button>

          {showHistory && (
            <div className="mt-8 w-full space-y-4">
              <h2 className="text-xl font-bold border-b border-gray-800 pb-4">Recent Polishes</h2>
              {history.map((item, index) => (
                <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
                  <p className="text-gray-400 mb-3 text-sm">{item.original}</p>
                  <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
                  <p className="text-white">{item.polished}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}