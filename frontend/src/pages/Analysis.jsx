import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useStore, useTodayStats } from '../store';
import { api } from '../api';

export default function Analysis() {
  const { mealHistory, profile } = useStore();
  const stats = useTodayStats();
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeChart, setActiveChart] = useState('calories');

  // 주간 데이터 생성 (로컬 기록 기반)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const meals = mealHistory[key] || [];
    const totals = meals.reduce((a, m) => ({
      calories: a.calories + (m.calories || 0),
      protein: a.protein + (m.protein || 0),
      carbs: a.carbs + (m.carbs || 0),
      fat: a.fat + (m.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return {
      day: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
      date: key,
      ...totals,
      goal: profile?.calorieGoal || 2000,
    };
  });

  // 오늘 데이터 덮어쓰기
  weeklyData[6] = { ...weeklyData[6], calories: stats.calories, protein: stats.protein, carbs: stats.carbs, fat: stats.fat };

  const avg = weeklyData.reduce((a, d) => a + d.calories, 0) / 7;

  const getInsight = async () => {
    setLoadingInsight(true);
    try {
      const data = await api.weeklyInsight({ weeklyData, userProfile: profile });
      setInsight(data);
    } catch {
      alert('인사이트 생성 실패. Ollama가 실행 중인지 확인해주세요.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const chartData = weeklyData;
  const COLORS = { calories: '#6C5CE7', protein: '#00B894', carbs: '#FD9644', fat: '#FF6B9D' };

  return (
    <div className="px-4">
      <div className="pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">분석 📊</h1>
        <p className="text-gray-500 text-sm mt-1">지난 7일 식단 리포트</p>
      </div>

      {/* 오늘 요약 카드 */}
      <div className="hero-gradient rounded-3xl p-5 text-white mb-4">
        <p className="text-white/80 text-sm mb-2">오늘 섭취 현황</p>
        <div className="flex justify-between">
          {[
            { label: '칼로리', value: stats.calories, unit: 'kcal' },
            { label: '단백질', value: Math.round(stats.protein), unit: 'g' },
            { label: '탄수화물', value: Math.round(stats.carbs), unit: 'g' },
            { label: '지방', value: Math.round(stats.fat), unit: 'g' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 차트 탭 선택 */}
      <div className="flex gap-2 overflow-x-auto mb-3">
        {[['calories', '칼로리'], ['protein', '단백질'], ['carbs', '탄수화물'], ['fat', '지방']].map(([k, l]) => (
          <button key={k} onClick={() => setActiveChart(k)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeChart === k ? 'text-white' : 'bg-white text-gray-500 border border-purple-100'}`}
            style={activeChart === k ? { backgroundColor: COLORS[k] } : {}}>
            {l}
          </button>
        ))}
      </div>

      {/* 주간 바 차트 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">주간 {activeChart === 'calories' ? '칼로리' : activeChart} 추이</h3>
          {activeChart === 'calories' && <span className="text-xs text-gray-400">평균 {Math.round(avg)}kcal</span>}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0eeff" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              formatter={(v) => [`${Math.round(v)}${activeChart === 'calories' ? 'kcal' : 'g'}`, '']}
            />
            <Bar dataKey={activeChart} fill={COLORS[activeChart]} radius={[6, 6, 0, 0]} />
            {activeChart === 'calories' && (
              <Bar dataKey="goal" fill="#e8e4ff" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 영양소 비율 */}
      <div className="card p-4 mb-4">
        <h3 className="font-bold text-gray-800 mb-3">오늘 영양소 비율</h3>
        {(() => {
          const total = stats.protein * 4 + stats.carbs * 4 + stats.fat * 9;
          if (!total) return <p className="text-sm text-gray-400 text-center py-4">아직 기록된 식사가 없어요</p>;
          return (
            <div className="space-y-3">
              {[
                { label: '탄수화물', value: stats.carbs, cal: stats.carbs * 4, color: 'bg-orange-400' },
                { label: '단백질', value: stats.protein, cal: stats.protein * 4, color: 'bg-blue-400' },
                { label: '지방', value: stats.fat, cal: stats.fat * 9, color: 'bg-pink-400' },
              ].map(n => (
                <div key={n.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{n.label} {Math.round(n.value)}g</span>
                    <span className="text-gray-400">{Math.round((n.cal / total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${n.color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.round((n.cal / total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* AI 인사이트 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800">AI 주간 인사이트 ✨</h3>
            <p className="text-xs text-gray-400 mt-0.5">맞춤 분석과 다음 주 팁</p>
          </div>
          {insight && (
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{insight.score}</div>
              <div className="text-xs text-gray-400">점</div>
            </div>
          )}
        </div>

        {!insight ? (
          <button onClick={getInsight} disabled={loadingInsight}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm active:scale-95 transition-all">
            {loadingInsight ? '⚙️ AI가 분석 중...' : '✨ AI 인사이트 받기'}
          </button>
        ) : (
          <div className="space-y-3 fade-up">
            <p className="text-sm text-gray-700 leading-relaxed">{insight.summary}</p>
            <div>
              <p className="text-xs font-bold text-green-600 mb-1">잘 하고 있어요 👍</p>
              {insight.strengths?.map((s, i) => <p key={i} className="text-xs text-gray-600">• {s}</p>)}
            </div>
            <div>
              <p className="text-xs font-bold text-orange-500 mb-1">이렇게 개선해봐요 💪</p>
              {insight.improvements?.map((s, i) => <p key={i} className="text-xs text-gray-600">• {s}</p>)}
            </div>
            <div className="bg-primary/5 rounded-xl p-3">
              <p className="text-xs font-bold text-primary mb-1">다음 주 팁 💡</p>
              <p className="text-xs text-gray-700">{insight.nextWeekTip}</p>
            </div>
            <button onClick={() => setInsight(null)} className="text-xs text-gray-400 text-center w-full">다시 분석하기</button>
          </div>
        )}
      </div>
    </div>
  );
}
