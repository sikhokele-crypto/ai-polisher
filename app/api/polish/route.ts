import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_BASE =
  "You are a helpful expert. Directly write the final content requested (e.g., the actual email, the actual workout, the actual poem). Do not provide a prompt for another AI. Do not use conversational filler. Just give the final result.";

const TONE_GUIDE: Record<string, string> = {
  Professional:
    "Use a formal, polished tone. Write like a business email or official document—clear, respectful, and to the point.",
  Creative:
    "Use a creative, engaging tone. Write like a story or playful piece—vivid, fun, and imaginative where appropriate.",
  Urgent:
    "Use a direct, urgent tone. Write with clarity and impact—short sentences, action-oriented, and immediately compelling.",
};

export async function POST(request: Request) {
  try {
    const { messyIdea, tone, imageDataUrl } = (await request.json()) as {
      messyIdea: string;
      tone?: string;
      imageDataUrl?: string | null;
    };
    const apiKey =
      process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey, {
      apiVersion: "v1",
    });

    const trimmed = typeof messyIdea === "string" ? messyIdea.trim() : "";
    const userContent =
      trimmed ||
      "I have no specific idea yet—suggest a short template or example of a well-written prompt.";

    const toneKey =
      tone && TONE_GUIDE[tone] ? tone : "Professional";
    const systemInstruction = `${SYSTEM_BASE} ${TONE_GUIDE[toneKey]}`;

    let requestPayload: unknown = userContent;

    if (imageDataUrl) {
      const [meta, data] = imageDataUrl.split(",", 2);
      const mimeMatch = meta?.match(/^data:(.+);base64$/);
      const mimeType = mimeMatch?.[1] ?? "image/png";
      const imageInstruction =
        "Interpret the text in this image and polish it into a professional format. Then apply any additional instructions from the user text.";

      requestPayload = [
        {
          inlineData: {
            mimeType,
            data,
          },
        },
        `${imageInstruction}\n\nUser text (if any): ${userContent}`,
      ];
    }

    const modelNames = ["gemini-pro", "gemini-2.5-flash"] as const;
    let lastError: unknown;
    let result: Awaited<ReturnType<ReturnType<typeof genAI.getGenerativeModel>["generateContent"]>> | null = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });
        result = await model.generateContent(requestPayload as any);
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("404") && !msg.includes("not found")) throw err;
      }
    }

    if (!result) {
      throw lastError ?? new Error("No model available");
    }
    let text: string;
    try {
      text = result.response.text();
    } catch {
      text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Unable to generate a polished prompt. Please try again.";
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Gemini polish error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message, text: `API error: ${message}` },
      { status: 500 }
    );
  }
}
