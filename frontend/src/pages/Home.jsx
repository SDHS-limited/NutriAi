import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, useTodayStats } from '../store';
import { api } from '../api';

function CircleProgress({ pct, size = 80, stroke = 8, color = '#fff' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        className="progress-ring__circle" />
    </svg>
  );
}

export default function Home() {
  const { profile, todayMeals } = useStore();
  const stats = useTodayStats();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState('checking');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '좋은 저녁이에요';
  const mealType = hour < 10 ? '아침' : hour < 15 ? '점심' : '저녁';

  useEffect(() => {
    api.health().then(d => setOllamaStatus(d.ollama)).catch(() => setOllamaStatus('disconnected'));
  }, []);

  const getRecommendations = async () => {
    setLoadingRec(true);
    try {
      const data = await api.recommendMeal({
        todayMeals,
        remainingCalories: stats.remaining,
        userProfile: profile,
        mealType,
      });
      setRecommendations(data.recommendations || []);
    } catch {
      alert('AI 추천을 불러오지 못했어요. Ollama가 실행 중인지 확인해주세요.');
    } finally {
      setLoadingRec(false);
    }
  };

  return (
    <div className="px-4 pb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between pt-12 pb-4">
        <div>
          <p className="text-gray-500 text-sm">{greeting}! 👋</p>
          <h1 className="text-2xl font-bold text-gray-800">{profile?.name}님</h1>
        </div>
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🥗</div>
          <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${ollamaStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} title={`Ollama ${ollamaStatus}`} />
        </div>
      </div>

      {/* 오늘의 칼로리 카드 */}
      <div className="hero-gradient rounded-3xl p-5 text-white mb-4 fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">오늘의 목표</p>
            <p className="text-3xl font-bold">{stats.calories.toLocaleString()}</p>
            <p className="text-white/70 text-sm">/ {stats.goal.toLocaleString()} kcal</p>
            <button
              onClick={() => navigate('/meal')}
              className="mt-3 bg-white text-primary font-semibold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              기록하기 ✓
            </button>
          </div>
          <div className="relative flex items-center justify-center">
            <CircleProgress pct={stats.pct} size={90} stroke={9} />
            <span className="absolute text-lg font-bold">{stats.pct}%</span>
          </div>
        </div>
      </div>

      {/* 영양소 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '단백질', value: stats.protein, unit: 'g', color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: '탄수화물', value: stats.carbs, unit: 'g', color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: '지방', value: stats.fat, unit: 'g', color: 'text-pink-500', bg: 'bg-pink-50' },
        ].map(n => (
          <div key={n.label} className={`${n.bg} rounded-2xl p-3 text-center fade-up`}>
            <p className={`text-xl font-bold ${n.color}`}>{Math.round(n.value)}</p>
            <p className="text-xs text-gray-500">{n.label} ({n.unit})</p>
          </div>
        ))}
      </div>

      {/* 오늘 먹은 것 */}
      {todayMeals.length > 0 && (
        <div className="card p-4 mb-4 fade-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">오늘 먹은 것 🍽️</h2>
            <span className="text-xs text-gray-400">{todayMeals.length}끼 기록</span>
          </div>
          <div className="flex flex-col gap-2">
            {todayMeals.slice(-3).map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.emoji || '🍱'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.time}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">{m.calories}kcal</span>
              </div>
            ))}
          </div>
          {todayMeals.length > 3 && (
            <button onClick={() => navigate('/meal')} className="text-xs text-primary mt-2 w-full text-center">
              전체 보기 ({todayMeals.length}개) →
            </button>
          )}
        </div>
      )}

      {/* AI 추천 섹션 */}
      <div className="card p-4 fade-up">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800">다음 끼니 뭐 먹을까요? 🤔</h2>
            <p className="text-xs text-gray-400 mt-0.5">남은 칼로리: {stats.remaining.toLocaleString()}kcal</p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <button
            onClick={getRecommendations}
            disabled={loadingRec}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm active:scale-95 transition-all"
          >
            {loadingRec ? '⚙️ AI가 분석 중...' : '✨ AI 추천받기'}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-2xl">
                <span className="text-2xl">{['🥩', '🥗', '🍜'][i] || '🍱'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.reason}</p>
                  <p className="text-xs text-primary font-medium mt-1">{r.calories}kcal · 단백질 {r.protein}g</p>
                </div>
              </div>
            ))}
            <button onClick={() => setRecommendations([])} className="text-xs text-gray-400 text-center">다시 추천받기</button>
          </div>
        )}
      </div>

      {/* Ollama 상태 경고 */}
      {ollamaStatus === 'disconnected' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl fade-up">
          <p className="text-xs text-amber-700 font-medium">⚠️ Ollama 연결 안됨</p>
          <p className="text-xs text-amber-600 mt-0.5">터미널에서 <code className="bg-amber-100 px-1 rounded">ollama serve</code> 를 실행해주세요.</p>
        </div>
      )}
    </div>
  );
}
