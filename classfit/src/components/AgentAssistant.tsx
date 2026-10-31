import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

export interface AgentAction {
  name: string;
  args: Record<string, string>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AgentAssistantProps {
  token: string;
  suggestions: string[];
  buildContext: () => Promise<string>;
  onAction: (action: AgentAction) => string | null;
}

export const AgentAssistant: React.FC<AgentAssistantProps> = ({ token, suggestions, buildContext, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, isBusy, isOpen]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsBusy(true);

    try {
      const context = await buildContext();
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, messages: nextMessages, context }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const results = (result.actions as AgentAction[]).map(onAction).filter(Boolean);
      const reply = [result.reply, ...results].filter(Boolean).join('\n');
      setMessages([...nextMessages, { role: 'assistant', text: reply || '답을 찾지 못했습니다.' }]);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'AI 비서가 답하지 못했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      {isOpen && (
        <section
          aria-label="AI 비서"
          className="fixed bottom-36 sm:bottom-40 left-4 sm:left-6 z-40 w-[calc(100vw-2rem)] max-w-sm h-[min(60vh,480px)] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              AI 비서
            </h2>
            <button
              type="button"
              title="닫기"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-slate-600">수행평가, 시간표, 준비물을 물어보거나 화면을 열어 달라고 말해 보세요.</p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="block w-full px-3 py-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <p
                key={index}
                className={`max-w-[85%] w-fit px-3 py-2 rounded-2xl whitespace-pre-line break-words ${
                  message.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {message.text}
              </p>
            ))}

            {isBusy && <p className="text-slate-500">답을 준비하고 있습니다.</p>}
            {error && <p className="font-semibold text-rose-700">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-2 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="메시지를 입력하세요"
              aria-label="AI 비서에게 보낼 메시지"
              className="flex-1 min-w-0 min-h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              title="보내기"
              disabled={isBusy || !input.trim()}
              className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 left-4 sm:left-6 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white/60 cursor-pointer"
        title="AI 비서 열기"
        aria-expanded={isOpen}
      >
        <Bot className="w-5 h-5" />
        <span className="text-[10px] sm:text-[11px] font-black tracking-tight leading-none">AI 비서</span>
      </button>
    </>
  );
};
