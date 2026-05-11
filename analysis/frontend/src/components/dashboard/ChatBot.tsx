import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

interface ChatBotProps {
  data: any;
}

export function ChatBot({ data }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "bot", content: string}[]>([
    { role: "bot", content: "Hi! I'm your AI Analysis Assistant. Ask me anything about the data currently on your screen." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [initProgress, setInitProgress] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !engine && !initProgress) {
      async function initWebLLM() {
        try {
          setInitProgress("Requesting WebGPU access...");
          const newEngine = await CreateMLCEngine("Phi-3-mini-4k-instruct-q4f16_1-MLC", {
            initProgressCallback: (progress) => {
              setInitProgress(progress.text);
            }
          });
          setEngine(newEngine);
          setInitProgress("");
        } catch (e: any) {
          console.error("WebLLM init failed:", e);
          setInitProgress(`Local AI error: ${e.message?.slice(0, 40) || 'WebGPU required'}`);
        }
      }
      initWebLLM();
    }
  }, [isOpen, engine, initProgress]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      if (!engine) throw new Error("Local WebLLM engine not ready");

      const contextStr = JSON.stringify(data).substring(0, 10000); 
      const prompt = `You are a helpful AI assistant for an analytics dashboard. 
Here is the JSON summary data of the user's current view:
${contextStr}

The user asks: "${userMessage}"
Please provide a polite, accurate, and concise response using only the data provided.`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }]
      });

      const reply = response.choices[0]?.message.content;
      if (!reply) throw new Error("Empty response from local AI");

      setMessages(prev => [...prev, { role: "bot", content: reply }]);

    } catch (err: any) {
      console.warn("AI failed, falling back to local...", err);
      const lowerInput = userMessage.toLowerCase();
      let reply = "I'm not sure I understand. Try asking about the 'summary', 'sentiment', 'top entities', 'top publications', or 'total articles'.";

      if (!data || !data.meta) {
        reply = "I don't have any data loaded yet.";
      } else if (lowerInput.includes("summary") || lowerInput.includes("overview")) {
        reply = `Current Dashboard Summary:\nTotal Articles: ${data.meta.total_articles || 0}\nEnglish Articles: ${data.meta.english_articles || 0}`;
      } else if (lowerInput.includes("sentiment")) {
        const donut = data.widgets?.sentiment_overview?.donut || [];
        const positive = donut.find((d: any) => d.name === "positive")?.value || 0;
        const neutral = donut.find((d: any) => d.name === "neutral")?.value || 0;
        const negative = donut.find((d: any) => d.name === "negative")?.value || 0;
        reply = `Sentiment Breakdown:\n• Positive: ${positive}\n• Neutral: ${neutral}\n• Negative: ${negative}`;
      } else if (lowerInput.includes("top") && (lowerInput.includes("entit") || lowerInput.includes("compan") || lowerInput.includes("people"))) {
        const ents = data.widgets?.top_companies?.data || [];
        reply = ents.length === 0 ? "There are no top companies listed." : "Top Companies:\n" + ents.slice(0, 5).map((e: any, i: number) => `${i + 1}. ${e.name} (${e.count})`).join("\n");
      } else if (lowerInput.includes("top") && (lowerInput.includes("publicat") || lowerInput.includes("journal"))) {
        const pubs = data.widgets?.top_publications?.data || [];
        reply = pubs.length === 0 ? "There are no top publications listed." : "Top Publications:\n" + pubs.slice(0, 5).map((p: any, i: number) => `${i + 1}. ${p.name} (${p.count})`).join("\n");
      } else if (lowerInput.includes("total") || lowerInput.includes("how many") || lowerInput.includes("count")) {
        reply = `There are a total of ${data.meta.total_articles || 0} articles.`;
      }

      setMessages(prev => [...prev, { role: "bot", content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Dashboard Assistant</h3>
                  <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Powered by WebLLM</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mb-1">
                      <Bot size={14} className="text-blue-600" />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-sm'
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={14} className="text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot size={14} className="text-blue-600" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {initProgress && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 font-mono text-center truncate">
                {initProgress}
              </div>
            )}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={initProgress && !engine && !initProgress.includes('error') ? "Downloading AI model locally..." : "Ask about your data..."}
                  disabled={!!(!engine && initProgress && !initProgress.includes('error'))}
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || !!(!engine && initProgress && !initProgress.includes('error'))}
                  className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
