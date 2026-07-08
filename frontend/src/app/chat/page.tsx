"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: "model", content: "Hi! I am the ENVISION AI Assistant. I can help you understand local AQI, environmental hazards, and answer any questions you have about pollution." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "model", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", content: "Sorry, I am having trouble connecting to my servers right now." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "model", content: "Sorry, a network error occurred." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-screen flex flex-col pt-6 pb-2 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-foreground/60 text-sm">Ask me about environmental guidelines, local AQI, or how to report an issue safely.</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-foreground/5 p-4 space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
              {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-background border border-black/5 dark:border-white/5 shadow-sm rounded-tl-none"}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
              <Bot size={20} />
            </div>
            <div className="p-3 rounded-2xl bg-background border border-black/5 dark:border-white/5 shadow-sm rounded-tl-none flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-foreground/40" />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="relative flex items-center">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
          className="w-full p-4 pr-14 rounded-full bg-foreground/10 border-none outline-none focus:ring-2 focus:ring-primary"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="absolute right-2 p-3 bg-primary text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
