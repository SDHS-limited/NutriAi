import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // 사용자 프로필
      profile: null,
      setProfile: (profile) => set({ profile }),

      // 오늘 식사 기록
      todayMeals: [],
      addMeal: (meal) => set((s) => ({ todayMeals: [...s.todayMeals, { ...meal, id: Date.now().toString(), time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }] })),
      removeMeal: (id) => set((s) => ({ todayMeals: s.todayMeals.filter(m => m.id !== id) })),

      // 날짜별 식사 기록
      mealHistory: {},
      saveTodayMeals: () => {
        const today = new Date().toISOString().split('T')[0];
        set((s) => ({ mealHistory: { ...s.mealHistory, [today]: s.todayMeals } }));
      },

      // AI 채팅 기록
      chatMessages: [],
      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),

      // 온보딩 완료 여부
      onboardingDone: false,
      setOnboardingDone: () => set({ onboardingDone: true }),
    }),
    {
      name: 'nutriai-store',
      partialize: (s) => ({
        profile: s.profile,
        mealHistory: s.mealHistory,
        onboardingDone: s.onboardingDone,
        chatMessages: s.chatMessages,
      }),
    }
  )
);

// 오늘 섭취 통계 계산 헬퍼
export function useTodayStats() {
  const { todayMeals, profile } = useStore();
  const totals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const goal = profile?.calorieGoal || 2000;
  return { ...totals, goal, remaining: Math.max(0, goal - totals.calories), pct: Math.min(100, Math.round((totals.calories / goal) * 100)) };
}
