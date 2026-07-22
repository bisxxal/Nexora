"use client";

import { chatAIAction } from "@/action/chat.ai";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Copy, Check, Send } from "lucide-react";

 
function CodeBlock({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children ?? "").replace(/\n$/, "");
  const lang = className?.replace("language-", "") || "code";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] my-3 text-sm">
      {/* header */}
      <div className="flex items-center justify-between bg-[#161b22] px-4 py-1.5 border-b border-[#30363d]">
        <span className="text-[11px] font-mono text-[#8b949e] tracking-wide">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#8b949e] border border-[#30363d] rounded-md px-2 py-0.5 hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* body */}
      <pre className="m-0 p-4 overflow-x-auto bg-[#0d1117]">
        <code className={`${className} font-mono text-[13px] leading-relaxed`}>{children}</code>
      </pre>
    </div>
  );
} 
function AssistantMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre({ children }) {
          return <>{children}</>;
        },
        code({ className, children, ...props }) {
          if (className?.startsWith("language-")) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
          }
          return (
            <code
              className="font-mono text-[12.5px] bg-slate-100 text-pink-700 border border-slate-200 px-1.5 py-0.5 rounded"
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 underline underline-offset-2 hover:text-indigo-700"
            >
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-base font-bold mb-1 mt-3">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-sm font-bold mb-1 mt-3">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-pink-400 pl-3 my-2 text-gray-500 italic bg-pink-50 rounded-r py-1">
              {children}
            </blockquote>
          );
        },
        strong({ children }) {
          return <strong className="font-semibold text-gray-900">{children}</strong>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="bg-gray-100 font-semibold px-3 py-1.5 text-left border border-gray-200">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-3 py-1.5 border border-gray-200 even:bg-gray-50">{children}</td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
 
function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          style={{ backgroundColor: color, animationDelay: `${delay}ms` }}
          className="block w-2 h-2 rounded-full animate-bounce"
        />
      ))}
    </div>
  );
}
 
export default function ChatbotPage({
  collections,
  welcomeMessage = "Hello! How can I assist you today?",
  id,
  sessionId: propSessionId,
  headerTitle = "Nexora AI",
  primaryColor = "#bed96d",
  buttonColor,
  buttonTextColor,
  theme = "light",
}: {
  collections: string;
  welcomeMessage: string;
  id: string;
  sessionId?: string;
  headerTitle?: string;
  primaryColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  theme?: "light" | "dark";
}) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stable session ID — persisted in localStorage so memory survives page reloads
  // and iframe resets. propSessionId comes from the embed URL (set by widget.js).
  const [sessionId] = useState(() => {
    if (propSessionId) return propSessionId;
    if (typeof window !== "undefined") {
      const KEY = "nexora_chat_session_id";
      let sid = localStorage.getItem(KEY);
      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem(KEY, sid);
      }
      return sid;
    }
    return "default-session";
  });

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !collections || !id || isLoading) return;

    const userMsg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from all messages except the first welcome message
      const history = messages.slice(1).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      const res = await chatAIAction(input, collections, id, sessionId, history, headerTitle);
      setMessages([...updated, { role: "assistant", content: res ?? "" }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // If buttonTextColor was explicitly passed (from embed), use it directly.
  // Otherwise derive it from the primaryColor luminance.
  const isDark = (() => {
    const hex = (buttonColor || primaryColor).replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  })();
  const btnTextColor = buttonTextColor || (isDark ? "#ffffff" : "#1a1a1a");
  // Effective button / header color
  const accentColor = buttonColor || primaryColor;

  return (
    /* Full-height flex column — messages scroll, input stays at bottom */
    <div className="flex flex-col flex-1 w-full bg-white overflow-hidden font-sans">

      {/*  Header  */}
      <div
        style={{ backgroundColor: accentColor }}
        className="flex items-center gap-3 px-4 py-3 shrink-0 shadow-sm"
      >
        {/* Logo dot */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow"
          style={{ backgroundColor: "rgba(255,255,255,0.25)", color: btnTextColor }}
        >
          <img src="/logo2.png " className="w-full h-full object-cover p-1" alt="" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-none" style={{ color: btnTextColor }}>
            {headerTitle}
          </p>
          <p className="text-[11px] opacity-70 mt-0.5" style={{ color: btnTextColor }}>
            ·    Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm p-0.5 "
                style={{ backgroundColor: accentColor, color: btnTextColor }}
              >
                <img src="/logo2.png " className="w-full h-full object-cover" alt="" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                msg.role === "user"
                  ? "rounded-br-sm text-sm"
                  : "bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm"
              }`}
              style={
                msg.role === "user"
                  ? { backgroundColor: accentColor, color: btnTextColor }
                  : undefined
              }
            >
              {msg.role === "assistant" ? (
                <AssistantMessage content={msg.content} />
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div
              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm"
              style={{ backgroundColor: accentColor, color: btnTextColor }}
            >
            <img src="/logo2.png " className="w-full h-full object-cover p-1" alt="" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <TypingDots color={accentColor} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/*  Input bar — naturally at bottom of flex column  */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-gray-400 transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 font-sans"
            placeholder="Ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: accentColor, color: btnTextColor }}
            title="Send"
          >
            <Send size={14} />
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Powered by{" "}
          <span className="font-semibold" style={{ color: accentColor }}>
            Nexora AI
          </span>
        </p>
      </div>
    </div>
  );
}
