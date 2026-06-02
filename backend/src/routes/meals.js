import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const mealsRouter = Router();

// 인메모리 저장소 (실제 서비스에서는 DB로 교체)
const store = new Map();

function getKey(userId, date) {
  return `${userId || 'default'}:${date}`;
}

// 날짜별 식사 조회
mealsRouter.get('/:date', (req, res) => {
  const key = getKey(req.query.userId, req.params.date);
  res.json(store.get(key) || []);
});

// 식사 추가
mealsRouter.post('/', (req, res) => {
  const { date, meal, userId } = req.body;
  const key = getKey(userId, date);
  const meals = store.get(key) || [];
  const newMeal = { ...meal, id: uuidv4(), createdAt: new Date().toISOString() };
  meals.push(newMeal);
  store.set(key, meals);
  res.json(newMeal);
});

// 식사 삭제
mealsRouter.delete('/:id', (req, res) => {
  const { date, userId } = req.query;
  const key = getKey(userId, date);
  const meals = (store.get(key) || []).filter(m => m.id !== req.params.id);
  store.set(key, meals);
  res.json({ ok: true });
});

// 주간 데이터
mealsRouter.get('/weekly/summary', (req, res) => {
  const { userId } = req.query;
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    const meals = store.get(getKey(userId, date)) || [];
    const totals = meals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    result.push({ date, ...totals, mealCount: meals.length });
  }
  res.json(result);
});
