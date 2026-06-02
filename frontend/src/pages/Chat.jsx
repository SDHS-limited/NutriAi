import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { api } from '../api';

const QUICK_PROMPTS = [
  '오늘 식단 평가해줘',
  '단백질 많은 음식 추천해줘',
  '다이어트에 좋은 저녁 메뉴는?',
  '오늘 칼로리가 목표를 넘었어. 어떻게 해?',
];

export default function Chat() {
  const { chatMessages, addChatMessage, clearChat, profile, todayMeals } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    addChatMessage(userMsg);
    setLoading(true);

    try {
      // 오늘 식단 컨텍스트 포함
      const contextMsg = todayMeals.length > 0
        ? [{ role: 'system', content: `오늘 사용자가 먹은 식사: ${todayMeals.map(m => `${m.name}(${m.calories}kcal)`).join(', ')}` }]
        : [];

      const allMessages = [...contextMsg, ...chatMessages.filter(m => m.role !== 'system'), userMsg];
      const data = await api.chat(allMessages, profile);
      addChatMessage({ role: 'assistant', content: data.reply });
    } catch {
      addChatMessage({ role: 'assistant', content: '죄송해요, 응답을 받지 못했어요. Ollama가 실행 중인지 확인해주세요. 🙏' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh">
      {/* 헤더 */}
      <div className="px-4 pt-12 pb-3 bg-white border-b border-purple-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">AI 영양사 상담 🤖</h1>
          <p className="text-xs text-gray-400">로컬 AI · Ollama 기반</p>
        </div>
        {chatMessages.length > 0 && (
          <button onClick={clearChat} className="text-xs text-gray-400 px-3 py-1.5 rounded-full border border-gray-200">
            초기화
          </button>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-20 h-20 rounded-full hero-gradient flex items-center justify-center text-4xl shadow-lg shadow-primary/30">
              🥗
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">안녕하세요!</p>
              <p className="text-gray-500 text-sm mt-1">영양, 식단에 대해<br/>무엇이든 물어보세요.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {QUICK_PROMPTS.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-left px-4 py-3 bg-purple-50 rounded-2xl text-sm text-gray-700 active:bg-purple-100 transition-all">
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex fade-up ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm mr-2 shrink-0 mt-1">🥗</div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white border border-purple-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {m.content.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 fade-up">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm shrink-0">🥗</div>
                <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* 빠른 제안 (메시지 있을 때) */}
      {chatMessages.length > 0 && !loading && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {QUICK_PROMPTS.slice(0, 3).map(q => (
            <button key={q} onClick={() => send(q)}
              className="shrink-0 px-3 py-1.5 bg-purple-50 rounded-full text-xs text-gray-600 active:bg-purple-100 transition-all">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="px-4 py-3 bg-white border-t border-purple-50 flex gap-2 pb-6">
        <input
          className="flex-1 border-2 border-purple-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          placeholder="영양사에게 물어보세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-primary/30">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
