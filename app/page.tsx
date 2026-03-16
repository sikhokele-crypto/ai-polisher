"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK_MESSAGE = "The AI is still refining your content. It will appear here in a moment.";
const TONES = ["Professional", "Creative", "Urgent"] as const;
type Tone = (typeof TONES)[number];

export default function PromptPolisher() {
  const [messyIdea, setMessyIdea] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [polishedPrompt, setPolishedPrompt] = useState("");
  const [showAd, setShowAd] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [hasResult, setHasResult] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  // 1. History State
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);

  const handlePolish = async () => {
    if (!messyIdea.trim()) return;
    
    setHasResult(false);
    setPolishedPrompt("");
    setSecondsLeft(15);
    
    try {
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messyIdea, tone }),
      });

      const data = await response.json();

      if (data.polished) {
        setPolishedPrompt(data.polished);
        setHasResult(true);
        // 2. Save to History logic
        setHistory(prev => [{ original: messyIdea, polished: data.polished }, ...prev]);
      }
    } catch (error) {
      console.error("Error:", error);
      setPolishedPrompt("Something went wrong. Please check your API key.");
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(polishedPrompt);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-black text-white font-sans">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        AI Prompt Polisher
      </h1>

      <div className="w-full max-w-2xl space-y-6 bg-gray-900/30 p-8 rounded-2xl border border-gray-800">
        <textarea
          className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
          placeholder="Paste your messy idea here..."
          value={messyIdea}
          onChange={(e) => setMessyIdea(e.target.value)}
        />

        <div className="flex gap-4">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                tone === t ? "bg-blue-600 border-blue-400" : "bg-gray-800 border-gray-700 hover:border-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={handlePolish}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Polish My Prompt
        </button>

        {polishedPrompt && (
          <div className="mt-8 p-6 bg-gray-900 border border-blue-900/30 rounded-xl relative">
            <button 
              onClick={copyToClipboard}
              className="absolute top-4 right-4 text-xs bg-gray-800 px-3 py-1 rounded-md hover:bg-gray-700"
            >
              {isCopying ? "Copied!" : "Copy"}
            </button>
            <h3 className="text-blue-400 font-bold mb-2">RESULT</h3>
            <p className="text-gray-200 leading-relaxed">{polishedPrompt}</p>
          </div>
        )}
      </div>

      {/* 3. History Display Section */}
      {history.length > 0 && (
        <div className="mt-12 w-full max-w-2xl border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-6">Recent Polishes</h2>
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
                <p className="text-gray-300 text-sm mb-3 italic">"{item.original}"</p>
                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
                <p className="text-white">{item.polished}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}