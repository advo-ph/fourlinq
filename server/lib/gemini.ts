import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
if (!GEMINI_API_KEY) {
  console.warn("⚠ GEMINI_API_KEY not set — chatbot features will be disabled");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate an embedding vector for the given text using Gemini.
 * Returns a 768-dimension float array.
 */
export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Chat completion with Gemini, with streaming.
 * Returns an async iterable of text chunks.
 */
export async function* chatStream(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  userMessage: string
): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });

  const chat = model.startChat({ history: messages });
  const result = await chat.sendMessageStream(userMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

export default genAI;
