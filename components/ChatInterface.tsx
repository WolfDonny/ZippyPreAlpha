
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  customRender?: (msg: Message) => React.ReactNode;
  onRestart?: () => void; // Added prop for restarting chat
  variant?: 'card' | 'full'; // Controls layout style
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  isLoading, 
  customRender, 
  onRestart,
  variant = 'card' 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
       inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden relative ${
      variant === 'card' 
        ? 'bg-white md:rounded-[2rem] md:shadow-xl md:border border-gray-100' 
        : 'bg-white'
    }`}>
        {/* Chat Header - Only show if not inside BookingDetailView which has its own header, or if simplified */}
        {!customRender && (
             <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    {/* NEW COOL LOGO */}
                    <div className="w-10 h-10 bg-gradient-to-br from-zippy-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-zippy-500/30 text-white transform -rotate-3">
                        <span className="font-display font-black italic text-xl">Z</span>
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-gray-800 text-lg leading-tight">Zippy</h2>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-gray-500 font-medium">Online</span>
                        </div>
                    </div>
                </div>

                {onRestart && (
                    <button 
                        onClick={onRestart}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-zippy-600 hover:bg-zippy-50 transition-all"
                        title="Start New Chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}
            </div>
        )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className="w-full flex flex-col">
              <div
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-6 py-4 rounded-3xl text-sm sm:text-base leading-relaxed animate-fade-in-up ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              {/* Custom content like Activity Cards */}
              {customRender && customRender(msg)}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 px-6 py-4 rounded-3xl rounded-tl-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full typing-dot"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white shrink-0">
        <div className="flex gap-2 items-center bg-gray-50 p-2 pl-4 rounded-full border border-gray-200 focus-within:border-zippy-300 focus-within:ring-2 focus-within:ring-zippy-100 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={customRender ? "Ask concierge... (e.g. Give me adventure experiences)" : "Type your vibe... (e.g., 'Beach party')"}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 text-base"
            disabled={isLoading}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
              !input.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-zippy-500 text-white shadow-md hover:bg-zippy-600 hover:scale-110 active:scale-95'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
