"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK_MESSAGE =
  "The AI is still refining your content. It will appear here in a moment.";

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
  const [history, setHistory] = useState<{ original: string; polished: string }[]>([]);
  const geminiResultRef = useRef<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!showAd) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowAd(false);
          const finalResult = geminiResultRef.current ?? FALLBACK_MESSAGE;
          setPolishedPrompt(finalResult);
          setHasResult(true);

          // Update History only when the result is finalized
          if (geminiResultRef.current && geminiResultRef.current !== FALLBACK_MESSAGE) {
            setHistory((prev) => [
              { original: messyIdea, polished: geminiResultRef.current! },
              ...prev,
            ]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showAd, messyIdea]);

  const handlePolish = () => {
    if (!messyIdea.trim()) return;

    setHasResult(false);
    setPolishedPrompt("");
    setSecondsLeft(15);
    geminiResultRef.current = null;
    setShowAd(true);

    fetch("/api/polish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messyIdea, tone, imageDataUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        const text =
          typeof data.text === "string"
            ? data.text
            : data.error
            ? `Error: ${data.error}`
            : FALLBACK_MESSAGE;
        geminiResultRef.current = text;
      })
      .catch((err) => {
        const message = err?.message ?? "Request failed";
        geminiResultRef.current = `Error: ${message}`;
      });
  };

  const handleCopy = async () => {
    if (!polishedPrompt) return;
    try {
      await navigator.clipboard.writeText(polishedPrompt);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 16px",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: "1120px" }}>
        <header style={{ marginBottom: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#808080" }}>
            Precision Prompt Studio
          </p>
          <h1 style={{ marginTop: "12px", fontSize: "32px", fontWeight: 600 }}>
            AI Prompt Polisher
          </h1>
        </header>

        <main
          style={{
            display: "grid",
            gap: "32px",
            alignItems: "stretch",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          }}
        >
          <section>
            <div
              style={{
                borderRadius: "24px",
                padding: "20px",
                background: "radial-gradient(circle at top left, #111827, #020617)",
                boxShadow: "0 0 45px rgba(168, 85, 247, 0.55)",
                border: "1px solid rgba(168, 85, 247, 0.5)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h2 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af" }}>
                  Your Messy Idea
                </h2>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    style={{
                      padding: "8px 14px",
                      fontSize: "12px",
                      borderRadius: "999px",
                      cursor: "pointer",
                      background: tone === t ? "#a855f7" : "rgba(168, 85, 247, 0.12)",
                      border: "1px solid #a855f7",
                      color: "white",
                    }}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={handleImageClick}
                  style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "999px", background: "#18181b", border: "1px solid #a855f7", color: "white", cursor: "pointer" }}
                >
                  📷 {imageDataUrl ? "Image Attached" : "Upload Image"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
              </div>

              <textarea
                value={messyIdea}
                onChange={(e) => setMessyIdea(e.target.value)}
                placeholder="Describe what you want..."
                style={{
                  width: "100%",
                  minHeight: "220px",
                  borderRadius: "16px",
                  border: "2px solid #a855f7",
                  backgroundColor: "#020617",
                  padding: "12px 16px",
                  color: "#ffffff",
                  outline: "none",
                }}
              />

              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handlePolish}
                  style={{
                    borderRadius: "999px",
                    padding: "10px 24px",
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #a855f7, #ec4899)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Polish with AI
                </button>
              </div>
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "11px", textTransform: "uppercase", color: "#9ca3af" }}>Result</h2>
              {hasResult && (
                <button onClick={handleCopy} style={{ background: "none", border: "1px solid #a855f7", color: "white", padding: "4px 12px", borderRadius: "999px", cursor: "pointer" }}>
                  {isCopying ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div style={{ flex: 1, borderRadius: "24px", border: "2px solid #a855f7", backgroundColor: "black", padding: "18px", boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}>
              <pre style={{ whiteSpace: "pre-wrap", color: "white", fontSize: "14px" }}>
                {hasResult ? polishedPrompt : "Your result will appear here..."}
              </pre>
            </div>
          </section>
        </main>

        {/* HISTORY SECTION */}
        {history.length > 0 && (
          <div style={{ marginTop: "60px", width: "100%", borderTop: "1px solid #1f2937", paddingTop: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Recent Polishes</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {history.map((item, index) => (
                <div key={index} style={{ padding: "20px", backgroundColor: "rgba(17, 24, 39, 0.5)", border: "1px solid #1f2937", borderRadius: "16px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Original</p>
                  <p style={{ color: "#d1d5db", marginBottom: "12px" }}>{item.original}</p>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>Polished</p>
                  <p style={{ color: "white" }}>{item.polished}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING MODAL */}
        {showAd && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
            <div style={{ textAlign: "center", padding: "40px", borderRadius: "24px", border: "2px solid #a855f7", background: "#020617" }}>
              <p style={{ color: "#a855f7", fontWeight: 700, marginBottom: "20px" }}>Optimising your prompt... {secondsLeft}s</p>
              <div style={{ width: "200px", height: "6px", backgroundColor: "#1f2937", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#a855f7", width: `${((15 - secondsLeft) / 15) * 100}%`, transition: "width 1s linear" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}