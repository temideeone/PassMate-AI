import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Info,
  Trash2,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../hooks/useAuth";
import { getTutorResponse } from "../services/geminiService";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import UpgradeModal from "../components/UpgradeModal";
import { analytics } from "../lib/analytics";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const { user, profile, isTrialActive } = useAuth();
  const isPremium = profile?.subscriptionStatus === 'premium' || profile?.role === 'admin';

  useEffect(() => {
    analytics.trackPageView("AI Tutor");
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your PassMate AI tutor. How can I help you with your studies today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questionsLeft = (profile?.subscriptionStatus === 'premium' || isTrialActive) ? Infinity : Math.max(0, 3 - (profile?.questionsUsedToday || 0));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or an image (JPEG, PNG, WEBP).");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];
      setSelectedFile({
        name: file.name,
        data: base64Data,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading || !user) return;

    if (questionsLeft <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    const userMessage: Message = { 
      role: "user", 
      content: selectedFile ? `[File: ${selectedFile.name}] ${input}` : input 
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFile = selectedFile;
    setInput("");
    setSelectedFile(null);
    setLoading(true);

    try {
      // Update usage count in Firestore
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          questionsUsedToday: increment(1),
          lastQuestionDate: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not update usage count:", err);
        // Continue anyway, don't block the AI response
      }

      // Prepare history for Gemini
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const responseText = await getTutorResponse(
        currentInput || (currentFile ? "Please analyze this document." : ""), 
        history,
        currentFile ? { data: currentFile.data, mimeType: currentFile.type } : undefined
      );
      
      const assistantMessage: Message = { 
        role: "assistant", 
        content: responseText || "I'm sorry, I couldn't generate a response. Please try again." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMessage = error?.message || "Sorry, I encountered an error. Please try again later.";
      
      if (errorMessage.includes("configuration missing")) {
        errorMessage = "AI Tutor is currently unavailable (Server configuration missing). Please ensure your GEMINI_API_KEY is set in the Secrets panel.";
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. How else can I help you?" }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Chat Info Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
            AI Tutor Online
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-black uppercase">
            <Sparkles className="w-3 h-3 mr-1" />
            {questionsLeft === Infinity ? 'Unlimited' : `${questionsLeft} questions left`}
          </div>
          <button 
            onClick={clearChat}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[92%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 sm:gap-3`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />}
                  </div>
                  <div className={`p-3 sm:p-4 rounded-2xl shadow-sm overflow-hidden break-words ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'}`}>
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed dark:prose-invert prose-pre:bg-gray-800 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:overflow-x-auto break-words">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {questionsLeft <= 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-indigo-600 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold">Daily limit reached!</p>
                  <p className="text-xs text-indigo-100">Upgrade to Premium for unlimited AI Tutor questions.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </motion.div>
          )}

          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  {selectedFile.type.includes('image') ? (
                    <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">
                    Ready to analyze
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                if (!isPremium && !isTrialActive) {
                  setIsUpgradeModalOpen(true);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              disabled={loading || questionsLeft <= 0}
              className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Upload PDF or Image"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="relative flex-grow">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={questionsLeft <= 0 ? "Daily limit reached. Upgrade for more." : (selectedFile ? "Ask a question about this file..." : "Ask me anything about your studies...")}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all text-sm dark:text-white dark:placeholder-gray-400"
                disabled={loading || questionsLeft <= 0}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedFile) || loading || questionsLeft <= 0}
                className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="mt-2 flex items-center justify-center space-x-4 text-[10px] text-gray-400 dark:text-gray-500">
            <div className="flex items-center">
              <Info className="w-3 h-3 mr-1" />
              AI can make mistakes. Verify important info.
            </div>
            {profile?.subscriptionStatus !== 'premium' && (
              <button 
                onClick={() => window.location.href = '/subscription'}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      </div>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </div>
  );
}
