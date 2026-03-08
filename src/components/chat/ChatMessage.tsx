import { memo } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = memo(({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-primary rounded-bl-md"
        }`}
      >
        {content || (isStreaming && (
          <span className="inline-flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
          </span>
        ))}
        {isStreaming && content && (
          <span className="inline-block w-1.5 h-4 bg-current/40 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
