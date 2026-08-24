import { useState, useRef, useEffect } from "preact/hooks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ chunk_id: string }>;
}

export function Widget({ config }: { config: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: config.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "" },
    ]);

    try {
      // In a real implementation this would point to the deployed API
      // We use localhost for development
      const API_URL = "http://localhost:3001/v1/chat";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: config.orgId,
          visitor_id: "visitor_" + Math.random().toString(36).substr(2, 9),
          query: userMessage.content,
        }),
      });

      if (!response.ok) throw new Error("API Error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.token) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMsgId
                          ? { ...msg, content: msg.content + data.token }
                          : msg,
                      ),
                    );
                  }
                  if (data.metadata?.citations) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMsgId
                          ? { ...msg, citations: data.metadata.citations }
                          : msg,
                      ),
                    );
                  }
                } catch (e) {
                  console.error("Error parsing SSE", e);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: "Sorry, I am having trouble connecting right now.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentWithCitations = (content: string) => {
    // Basic parser for [1] citations
    const parts = content.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      if (part.match(/^\[\d+\]$/)) {
        return (
          <span key={i} className="aw-citation" title="View Source">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className={`aw-widget-container ${config.position}`}
      style={{ "--theme-color": config.color } as any}
    >
      <div className={`aw-chat-window ${isOpen ? "aw-open" : ""}`}>
        <div className="aw-header" style={{ background: config.color }}>
          <span>AI Support</span>
          <button className="aw-close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>
        <div className="aw-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`aw-message aw-${msg.role}`}
              style={
                msg.role === "assistant" ? { background: config.color } : {}
              }
            >
              {renderContentWithCitations(msg.content)}
            </div>
          ))}
          {isLoading && (
            <div
              className="aw-message aw-assistant"
              style={{ background: config.color, opacity: 0.7 }}
            >
              <span className="typing-dot">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="aw-input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            className="aw-input"
            placeholder="Type your message..."
            value={input}
            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="aw-send-btn"
            disabled={isLoading || !input.trim()}
          >
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>

      {!isOpen && (
        <button
          className="aw-launcher"
          style={{ background: config.color }}
          onClick={() => setIsOpen(true)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
