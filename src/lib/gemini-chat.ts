export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

let chatHistory: ChatMessage[] = [];

export function resetChat() {
  chatHistory = [];
}

export async function* streamChat(
  userMessage: string
): AsyncGenerator<string> {
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      history: chatHistory.slice(0, -1),
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullResponse = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.chunk) {
          fullResponse += data.chunk;
          yield data.chunk;
        }
        if (data.error) {
          throw new Error(data.error);
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  chatHistory.push({
    role: "model",
    parts: [{ text: fullResponse }],
  });
}
