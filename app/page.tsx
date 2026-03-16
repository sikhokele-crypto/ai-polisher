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
          setPolishedPrompt(geminiResultRef.current ?? FALLBACK_MESSAGE);
          setHasResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showAd]);

  const handlePolish = () => {
    setHasResult(false);
    setPolishedPrompt("");setHistory(prev => [{ original: messyIdea, polished: data.polished }, ...prev]);

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
        setPolishedPrompt((prev) =>
          prev === FALLBACK_MESSAGE || !prev ? text : prev
        );
      })
      .catch((err) => {
        const message = err?.message ?? "Request failed";
        geminiResultRef.current = `Error: ${message}`;
        setPolishedPrompt((prev) =>
          prev === FALLBACK_MESSAGE || !prev ? `Error: ${message}` : prev
        );
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
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: "1120px" }}>
        <header style={{ marginBottom: "40px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "#808080",
            }}
          >
            Precision Prompt Studio
          </p>
          <h1 style={{ marginTop: "12px", fontSize: "32px", fontWeight: 600 }}>
            AI Prompt Polisher
          </h1>
          <p
            style={{
              marginTop: "16px",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#d4d4d4",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Turn rough ideas into{" "}
            <span style={{ color: "#e9d5ff" }}>ready‑to‑use outputs</span>{" "}
            with premium polish.
          </p>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <h2
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#9ca3af",
                  }}
                >
                  Your Messy Idea
                </h2>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    border: "1px solid rgba(168, 85, 247, 0.7)",
                    backgroundColor: "rgba(168, 85, 247, 0.08)",
                    color: "#e9d5ff",
                  }}
                >
                  Raw → Refined
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "12px",
                  alignItems: "center",
                }}
              >
                {TONES.map((t) => {
                  const selected = tone === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#f5f3ff",
                        background: "rgba(168, 85, 247, 0.12)",
                        border: selected
                          ? "2px solid #a855f7"
                          : "1px solid rgba(168, 85, 247, 0.5)",
                        borderRadius: "999px",
                        cursor: "pointer",
                        boxShadow: selected
                          ? "0 0 20px rgba(168, 85, 247, 0.8)"
                          : "0 0 12px rgba(168, 85, 247, 0.4)",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleImageClick}
                  style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#f5f3ff",
                    background: "rgba(24, 24, 27, 0.9)",
                    border: "1px solid rgba(168, 85, 247, 0.7)",
                    borderRadius: "999px",
                    cursor: "pointer",
                    boxShadow: "0 0 16px rgba(168, 85, 247, 0.7)",
                  }}
                >
                  📷 Upload Image
                </button>
                {imageDataUrl && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#a5b4fc",
                    }}
                  >
                    Image attached
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <textarea
                value={messyIdea}
                onChange={(e) => setMessyIdea(e.target.value)}
                placeholder="Describe what you want. Email, workout, poem, plan—messy is fine."
                style={{
                  width: "100%",
                  minHeight: "220px",
                  resize: "none",
                  borderRadius: "16px",
                  border: "2px solid #a855f7",
                  backgroundColor: "#020617",
                  padding: "12px 16px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#ffffff",
                  outline: "none",
                  boxShadow: "0 0 35px rgba(168, 85, 247, 0.6)",
                }}
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <p style={{ fontSize: "11px", color: "#9ca3af", maxWidth: "70%" }}>
                  Pick a tone, click polish, and wait 15 seconds for the sponsored
                  optimisation.
                </p>
                <button
                  type="button"
                  onClick={handlePolish}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "999px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    background:
                      "linear-gradient(90deg, #a855f7, #ec4899, #8b5cf6)",
                    boxShadow: "0 0 35px rgba(168, 85, 247, 0.8)",
                    border: "none",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 60px rgba(168, 85, 247, 1)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 35px rgba(168, 85, 247, 0.8)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span
                    style={{
                      height: "8px",
                      width: "8px",
                      borderRadius: "999px",
                      backgroundColor: "#4ade80",
                      boxShadow: "0 0 10px rgba(74, 222, 128, 0.9)",
                    }}
                  />
                  Polish with AI
                </button>
              </div>
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#9ca3af",
                }}
              >
                Result
              </h2>
              {hasResult && (
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "999px",
                    border: "1px solid rgba(168, 85, 247, 0.7)",
                    backgroundColor: "rgba(168, 85, 247, 0.15)",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#f5f3ff",
                    boxShadow: "0 0 16px rgba(168, 85, 247, 0.7)",
                    cursor: "pointer",
                  }}
                >
                  {isCopying ? "Copied! ✅" : "Copy to Clipboard"}
                </button>
              )}
            </div>

            <div style={{ position: "relative", flex: 1 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "24px",
                  background:
                    "radial-gradient(circle at top left, rgba(168,85,247,0.35), rgba(37,99,235,0.2))",
                  filter: "blur(40px)",
                  opacity: 0.6,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  borderRadius: "24px",
                  border: "2px solid #a855f7",
                  backgroundColor: "rgba(0,0,0,0.9)",
                  padding: "16px 18px",
                  boxShadow: "0 0 55px rgba(168, 85, 247, 0.9)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {hasResult ? (
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#ffffff",
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    {polishedPrompt}
                  </pre>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: "0 16px",
                      color: "#d4d4d4",
                      fontSize: "14px",
                    }}
                  >
                    Your result will appear here after the countdown.
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {showAd && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
              backgroundColor: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              padding: "16px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                borderRadius: "22px",
                border: "2px solid #a855f7",
                boxShadow: "0 0 60px rgba(168, 85, 247, 0.85)",
                background:
                  "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(0,0,0,0.9))",
                padding: "18px",
                textAlign: "center",
              }}
            >
              <div style={{ color: "#e9d5ff", fontWeight: 700, fontSize: "14px" }}>
                Wait for it... Sponsored Content
              </div>
              <div style={{ marginTop: "14px", display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    border: "3px solid rgba(168, 85, 247, 0.25)",
                    borderTopColor: "#a855f7",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "460px",
                borderRadius: "24px",
                padding: "1px",
                background: "radial-gradient(circle at top left, #111827, #020617)",
                boxShadow: "0 0 80px rgba(168, 85, 247, 0.95)",
                border: "1px solid rgba(168, 85, 247, 0.7)",
              }}
            >
              <div
                style={{
                  borderRadius: "22px",
                  background: "linear-gradient(to bottom, #020617, #020617, #000000)",
                  padding: "24px 28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        height: "28px",
                        width: "28px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "999px",
                        backgroundColor: "rgba(168, 85, 247, 0.2)",
                        border: "1px solid rgba(168, 85, 247, 0.6)",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#f5f3ff",
                      }}
                    >
                      AI
                    </span>
                    <p
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        color: "#9ca3af",
                      }}
                    >
                      Optimising
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {secondsLeft}s
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#e5e7eb" }}>
                  AI is optimising...{" "}
                  <span style={{ color: "#e9d5ff", fontWeight: 600 }}>
                    Sponsored by AdPartner
                  </span>
                </p>
                <div style={{ marginTop: "16px" }}>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      borderRadius: "999px",
                      backgroundColor: "#1f2937",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "999px",
                        background: "linear-gradient(90deg, #a855f7, #ec4899, #22c55e)",
                        transition: "width 1s linear",
                        width: `${((15 - secondsLeft) / 15) * 100}%`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      color: "#9ca3af",
                    }}
                  >
                    <span>Calibrating tone &amp; structure</span>
                    <span style={{ color: "#d4d4d4" }}>
                      {Math.max(secondsLeft, 0)}s remaining
                    </spa{history.length > 0 && (
  <div className="mt-12 w-full max-w-2xl border-t border-gray-800 pt-8">
    <h2 className="text-xl font-bold text-white mb-6">Recent Polishes</h2>
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
          <p className="text-gray-300 mb-3">{item.original}</p>
          <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
          <p className="text-white">{item.polished}</p>
        </div>
      ))}
    </div>
  </div>
)}n>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}