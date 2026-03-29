import { Character } from "@/data/characters";
import { ChatMessage, sendMessage } from "@/api/openrouter";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";
import CharacterDetailsDialog from "@/components/CharacterDetailsDialog";

interface Props {
  character: Character;
  onBack: () => void;
}

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatView({ character, onBack }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string>("Ready");
  const [showDetails, setShowDetails] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const storageKey = `kera-chat-${character.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DisplayMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {
        // ignore invalid JSON
      }
    }
    setMessages([{ role: "assistant", content: character.firstMessage }]);
  }, [character.id, character.firstMessage, storageKey]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Protect refresh/navigate away if there is chat history
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (messages.length > 1) {
        event.preventDefault();
        // Standard browser confirmation; custom text only works in some browsers.
        event.returnValue = "You have chat data. Refreshing will clear the conversation.";
        return event.returnValue;
      }
      return undefined;
    };

    const keyDownHandler = (event: KeyboardEvent) => {
      if (messages.length > 1 && (event.key === "F5" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r"))) {
        event.preventDefault();
        setShowRefreshConfirm(true);
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("keydown", keyDownHandler);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: DisplayMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const apiMessages: ChatMessage[] = [
      { role: "system", content: character.personality },
      ...newMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    try {
      setStatusLabel("Requesting AI...");
      const reply = await sendMessage(apiMessages, {
        timeoutMs: 9000,
        maxTokens: 120,
        temperature: 0.7,
      });

      setStatusLabel("Typing...");
      setIsTyping(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const speed = 6; // ms per character; a little faster integration
      let index = 0;

      while (index <= reply.length) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            last.content = reply.slice(0, index);
          }
          return updated;
        });

        index += 1;
        await new Promise((resolve) => setTimeout(resolve, speed));
      }

      setIsTyping(false);
    } catch (err) {
      console.error("Chat error:", err);
      let errorMsg = "⚠️ Unable to get response from AI.";

      if (err instanceof Error) {
        if (err.message === "API_NOT_CONFIGURED") {
          errorMsg = "⚠️ API key not configured. Please add your OpenRouter API key.";
        } else if (err.message.startsWith("RATE_LIMIT_UPSTREAM")) {
          errorMsg = "⏱️ AI models are experiencing extremely high traffic. The system automatically retried multiple times but couldn't get through. Please:\n1️⃣ Wait 15-30 minutes and try again\n2️⃣ Or check status: openrouter.ai/status";
        } else if (err.message.startsWith("RATE_LIMIT")) {
          errorMsg = "⏱️ API rate limited. The system tried multiple times with delays. Please wait before sending another message.";
        } else if (err.message.startsWith("NO_CREDITS")) {
          errorMsg = "💳 This model requires a paid account. The free tier has reached its limit. Try again later or upgrade to a paid plan at openrouter.ai.";
        } else if (err.message.startsWith("API_KEY_LIMIT")) {
          errorMsg = "💰 Free API usage limit reached. The monthly free quota has been used up. Please try again next month or consider a paid plan.";
        } else if (err.message.startsWith("API_FORBIDDEN")) {
          errorMsg = "❌ API access denied. Please check your API key configuration.";
        } else if (err.message.startsWith("MODEL_NOT_FOUND")) {
          errorMsg = "🤖 The AI model is temporarily unavailable. This could mean:\n• The model endpoint is down\n• Free tier models are overloaded\n• The model is not available in your region\n\nPlease wait a few minutes and try again!";
        } else if (err.message.includes("Invalid API key")) {
          errorMsg = "❌ Invalid API key. Please verify your key at openrouter.ai";
        } else if (err.message.includes("Network")) {
          errorMsg = "🌐 Network error. Please check your internet connection.";
        } else {
          errorMsg = `⚠️ ${err.message}`;
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      setStatusLabel("Error: check message above");
      setIsTyping(false);
    }

    setLoading(false);
    if (!isTyping) {
      setStatusLabel("Ready");
    }
  };

  return (
    <motion.div
      className="flex h-[100dvh] flex-col bg-background"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <img
          src={character.image}
          alt={character.name}
          className="h-8 w-8 rounded-full border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {character.name}
          </h2>
          <p className="truncate text-xs text-muted-foreground">{character.subtitle}</p>
        </div>
        <button
          onClick={() => setShowDetails(true)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          title="View character details"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Tags Section */}
      <div className="border-b border-border bg-card/50 px-3 py-1.5">
        <div className="flex flex-wrap gap-1.5">
          {character.tags.map(
            (tag, idx) =>
              tag && (
                <span
                  key={idx}
                  className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary font-medium"
                >
                  {tag}
                </span>
              )
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to clear the history? This cannot be undone."
              );
              if (!confirmed) {
                setStatusLabel("Clear history canceled");
                return;
              }
              setMessages([{ role: "assistant", content: character.firstMessage }]);
              localStorage.removeItem(storageKey);
              setStatusLabel("Conversation cleared");
            }}
            className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
          >
            Clear history
          </button>
        </div>
        <div className="text-xs text-muted-foreground">Status: {statusLabel}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i === messages.length - 1 ? 0.1 : 0 }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                typing...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Ads Space - Non-intrusive banner */}
      <div className="border-t border-border bg-muted/30 px-3 py-1.5">
        <div className="mx-auto flex max-w-4xl items-center justify-center">
          <div className="text-center text-xs text-muted-foreground">
            <span>Ads Space - Your ad here</span>
            {/* Replace this div with your actual ad code */}
            <div className="mt-0.5 h-6 w-full rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-slate-500 dark:text-slate-400 text-xs">728x90 Banner Ad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-200 hover:glow-primary disabled:opacity-40 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {showRefreshConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 text-left shadow-2xl border border-slate-700">
            <h3 className="mb-3 text-lg font-bold text-white">⚠️ Refresh Confirmation</h3>
            <p className="mb-5 text-sm text-slate-300">
              If you refresh the page, current chat history will be lost. Do you want to continue?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg border border-slate-500 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={() => setShowRefreshConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Refresh anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Details Dialog */}
      <CharacterDetailsDialog
        character={character}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </motion.div>
  );
}
