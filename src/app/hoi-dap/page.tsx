"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, Bot, User, Trash2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function HoiDapPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Placeholder for streaming response
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error(`Lỗi ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const json = JSON.parse(raw);
            if (json.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
                };
                return updated;
              });
              break;
            }
            if (json.text) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + json.text,
                };
                return updated;
              });
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Xin lỗi, không thể kết nối. Vui lòng thử lại sau.",
        };
        return updated;
      });
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setInput("");
  }

  return (
    <div className="flex flex-col h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
            <MessageCircle size={20} className="text-violet-500" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-stone-700">Hỏi đáp AI</h1>
            <p className="text-[11px] text-stone-400">Trợ lý thông minh Meisy — hỏi bất cứ điều gì</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-stone-400
              hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <Trash2 size={13} />
            Xoá cuộc trò chuyện
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-3xl bg-violet-100 flex items-center justify-center">
              <Bot size={32} className="text-violet-400" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-stone-600 mb-1">Xin chào! Tôi là trợ lý AI Meisy</p>
              <p className="text-[13px] text-stone-400 leading-relaxed">
                Bạn có thể hỏi tôi về quy trình sản xuất, đổi trả hàng,<br />
                kho hàng, kế toán, lương nhân viên hoặc bất cứ điều gì khác.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-sm">
              {[
                "Quy trình đổi trả hàng?",
                "Cách tính lương nhân viên?",
                "Chính sách xử lý sự cố?",
                "Hướng dẫn nhập kho NPL",
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="px-3 py-2 rounded-xl border border-stone-200 text-[12px] text-stone-500
                    hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={16} className="text-violet-500" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap
                ${msg.role === "user"
                  ? "bg-violet-500 text-white rounded-tr-sm"
                  : "bg-white border border-stone-100 text-stone-700 shadow-sm rounded-tl-sm"
                }`}
            >
              {msg.content || (
                <span className="flex items-center gap-1.5 text-stone-400">
                  <Loader2 size={14} className="animate-spin" />
                  Đang soạn câu trả lời...
                </span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={16} className="text-rose-400" />
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-white">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn... (Enter để gửi, Shift+Enter xuống dòng)"
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-2xl border border-stone-200 text-[13.5px]
              text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-violet-300
              focus:ring-2 focus:ring-violet-100 bg-stone-50 transition-all leading-relaxed
              max-h-32 overflow-y-auto"
            style={{ minHeight: "48px" }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center flex-shrink-0
              hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loading ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-300 mt-2">
          AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng với quản lý.
        </p>
      </div>
    </div>
  );
}
