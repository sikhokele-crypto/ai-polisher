"use client";

import { useEffect, useRef, useState } from "react";

const TONES = ["Professional", "Creative", "Urgent"] as const;
type Tone = (typeof TONES)[number];

export default function PromptPolisher() {
  const [messyIdea, setMessyIdea] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [polishedPrompt, setPolishedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [hasResult, setHasResult] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const handlePolish = async () => {
    if (!messyIdea.trim()) return;
    
    setIsLoading(true); // Start loading
    setHasResult(false);
    setPolishedPrompt("");

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
        setHistory((prev) => [
          { original: messyIdea, polished: data.polished },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Error polishing prompt:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(polishedPrompt);
    alert("Copied to clipboard!");
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-12 space-y-6">
        <h1 className="text-4xl font-bold text-center tracking-tight">AI Prompt Polisher</h1>
        
        {/* Tone Selector */}
        <div className="flex justify-center gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tone === t ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea 
            className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
            rows={6}
            placeholder="Describe your idea in a messy way..."
            value={messyIdea}
            onChange={(e) => setMessyIdea(e.target.value)}
          />
          {messyIdea && (
            <button 
              onClick={() => setMessyIdea("")}
              className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handlePolish}
            disabled={isLoading || !messyIdea}
            className={`px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
              isLoading ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {isLoading ? "Polishing..." : "Polish Prompt"}
          </button>
        </div>

        {hasResult && (
          <div className="mt-8 p-6 bg-gray-900 border border-blue-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Polished Result</span>
              <button onClick={copyToClipboard} className="text-xs text-gray-400 hover:text-white underline">
                Copy text
              </button>
            </div>
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

        {isHistoryVisible && (
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