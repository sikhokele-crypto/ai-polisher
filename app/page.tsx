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
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  
  // 1. History and Toggle States
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const geminiResultRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePolish = async () => {
    setHasResult(false);
    setPolishedPrompt("");
    setSecondsLeft(15);
    geminiResultRef.current = null;
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
        
        // Update history correctly without squashing lines
        setHistory((prev) => [
          { original: messyIdea, polished: data.polished },
          ...prev
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      {/* Your Main UI (Input boxes, Polish button, etc.) goes here */}
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
      }

      {/* Result Area */}
      {hasResult && (
        <div className="mt-8 p-6 bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-2xl">
          <p className="text-gray-300">{polishedPrompt}</p>
        </div>
      )}

      {/* 2. The Show History Button */}
      {history.length > 0 && (
        <div className="mt-12">
          <button
            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all text-sm font-bold border border-gray-700"
          >
            {isHistoryVisible ? "Hide History" : "Show History"}
          </button>
        </div>
      )}

      {/* 3. The Toggleable History List */}
      {isHistoryVisible && history.length > 0 && (
        <div className="mt-8 w-full max-w-2xl border-t border-gray-800 pt-8 pb-20">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Recent Polishes</h2>
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
                <p className="text-gray-400 text-sm mb-3">{item.original}</p>
                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
                <p className="text-white text-sm">{item.polished}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}