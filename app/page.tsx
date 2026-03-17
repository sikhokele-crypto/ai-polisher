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
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">AI Prompt Polisher</h1>
      <textarea 
        className="w-full max-w-2xl p-4 bg-gray-900 border border-gray-800 rounded-xl mb-4"
        placeholder="Enter your idea..."
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
        <div className="mt-8 p-6 bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-2xl text-center">
          <p className="text-gray-200">{polishedPrompt}</p>
        </div>
      )}
    </main>
  );
}