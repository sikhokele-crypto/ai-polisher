"use client";

import { useEffect, useRef, useState } from "react";

const TONES = ["Professional", "Creative", "Urgent"] as const;
type Tone = (typeof TONES)[number];

export default function PromptPolisher() {
  const [messyIdea, setMessyIdea] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [polishedPrompt, setPolishedPrompt] = useState("");
  const [showAd, setShowAd] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [hasResult, setHasResult] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const geminiResultRef = useRef<string | null>(null);

  const handlePolish = async () => {
    setHasResult(false);
    setPolishedPrompt("");
    setSecondsLeft(15);
    setShowAd(true);

    try {
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messyIdea, tone, imageDataUrl }),
      });

      const data = await response.json();

      if (data.polished) {
        setPolishedPrompt(data.polished);
        setHasResult(true);

        // FIXED LINE 41: Clean history update logic
        setHistory((prev) => [
          { original: messyIdea, polished: data.polished },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Error polishing prompt:", error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-12 space-y-6">
        <h1 className="text-4xl font-bold text-center">AI Prompt Polisher</h1>
        
        {/* FIXED LINE 57: Cleaned up the textarea visibility and focus */}
        <textarea 
          className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
          rows={5}
          placeholder="Enter your messy idea here..."
          value={messyIdea}
          onChange={(e) => setMessyIdea(e.target.value)}
        />

        <div className="flex justify-center">
          <button 
            onClick={handlePolish}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-500/20"
          >
            Polish Prompt
          </button>
        </div>

        {/* FIXED LINE 75: Restored result container with whitespace preservation */}
        {hasResult && (
          <div className="mt-8 p-6 bg-gray-900 border border-blue-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {polishedPrompt}
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="flex justify-center pt-8">
            <button
              onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all text-sm font-bold border border-gray-700"
            >
              {isHistoryVisible ? "Hide History" : "Show History"}
            </button>
          </div>
        )}

        {isHistoryVisible && history.length > 0 && (
          <div className="mt-8 border-t border-gray-800 pt-8 pb-20 space-y-4">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Recent Polishes</h2>
            {history.map((item, index) => (
              <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
                <p className="text-gray-400 text-sm mb-3">{item.original}</p>
                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
                <p className="text-white text-sm">{item.polished}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}