const BASE = '/api';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`API 오류 ${res.status}`);
  return res.json();
}

export const api = {
  // 헬스체크
  health: () => request('/health'),

  // AI 채팅
  chat: (messages, userProfile) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, userProfile }) }),
  recommendMeal: (data) => request('/ai/recommend-meal', { method: 'POST', body: JSON.stringify(data) }),
  weeklyInsight: (data) => request('/ai/weekly-insight', { method: 'POST', body: JSON.stringify(data) }),

  // 영양 분석
  analyzeFood: (foodName, amount) => request('/nutrition/analyze', { method: 'POST', body: JSON.stringify({ foodName, amount }) }),
  analyzeImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${BASE}/nutrition/analyze-image`, { method: 'POST', body: form }).then(r => r.json());
  },

  // 식사 기록 (백엔드 동기화 선택사항)
  getMeals: (date) => request(`/meals/${date}`),
  addMeal: (data) => request('/meals', { method: 'POST', body: JSON.stringify(data) }),
  deleteMeal: (id, date) => request(`/meals/${id}?date=${date}`, { method: 'DELETE' }),
  weeklySummary: () => request('/meals/weekly/summary'),
};
