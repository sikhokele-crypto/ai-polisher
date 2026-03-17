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
  
  // The History State
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);

  const geminiResultRef = useRef<string | null>(null);

  const handlePolish = async () => {
    // Reset UI for new request
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

        // This is the clean Line 44-46 logic that worked
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
      <h1 className="text-4xl font-bold mb-8 mt-12">AI Prompt Polisher</h1>
      
      <textarea 
        className="w-full max-w-2xl p-4 bg-gray-900 border border-gray-800 rounded-xl mb-4"
        placeholder="Enter your messy idea..."
        value={messyIdea}
        onChange={(e) => setMessyIdea(e.target.value)}
      />

      <button 
        onClick={handlePolish}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all"
      >
        Polish Prompt
      </button>

      {hasResult && (
        <div className="mt-8 p-6 bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-2xl">
          <p className="text-gray-300">{polishedPrompt}</p>
        </div>
      )}

      {/* History List Section */}
      {history.length > 0 && (
        <div className="mt-12 w-full max-w-2xl border-t border-gray-800 pt-8 pb-20">
          <h2 className="text-xl font-bold text-white mb-6">Recent Polishes</h2>
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
                <p className="text-gray-400 mb-3">{item.original}</p>
                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
                <p className="text-white">{item.polished}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}