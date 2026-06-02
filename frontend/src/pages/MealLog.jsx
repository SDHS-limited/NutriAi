import { useState } from 'react';
import { useStore } from '../store';
import { api } from '../api';

const MEAL_TYPES = ['아침 🌅', '점심 ☀️', '간식 🍪', '저녁 🌙'];
const QUICK_FOODS = [
  { name: '흰쌀밥', calories: 310, protein: 6, carbs: 68, fat: 1, emoji: '🍚' },
  { name: '닭가슴살', calories: 165, protein: 31, carbs: 0, fat: 4, emoji: '🍗' },
  { name: '바나나', calories: 89, protein: 1, carbs: 23, fat: 0, emoji: '🍌' },
  { name: '삶은 계란', calories: 78, protein: 6, carbs: 1, fat: 5, emoji: '🥚' },
  { name: '아메리카노', calories: 10, protein: 0, carbs: 2, fat: 0, emoji: '☕' },
  { name: '김치찌개', calories: 180, protein: 12, carbs: 8, fat: 9, emoji: '🍲' },
];

export default function MealLog() {
  const { todayMeals, addMeal, removeMeal } = useStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [amount, setAmount] = useState('1인분');
  const [activeTab, setActiveTab] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imageResults, setImageResults] = useState([]);

  const totalToday = todayMeals.reduce((a, m) => a + m.calories, 0);

  const searchFood = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.analyzeFood(search, amount);
      setResult({ ...data, emoji: '🍱' });
    } catch {
      alert('음식 분석에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(URL.createObjectURL(file));
    setLoading(true);
    try {
      const data = await api.analyzeImage(file);
      setImageResults(data.foods || []);
    } catch {
      alert('이미지 분석 실패. Vision 모델(llava 등)이 필요합니다.');
    } finally {
      setLoading(false);
    }
  };

  const addToLog = (food) => {
    addMeal(food);
    setResult(null);
    setSearch('');
    setImageResults([]);
    setImageFile(null);
  };

  return (
    <div className="px-4">
      {/* 헤더 */}
      <div className="pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">식단 기록 📝</h1>
        <p className="text-gray-500 text-sm mt-1">오늘 섭취: <span className="text-primary font-semibold">{totalToday}kcal</span></p>
      </div>

      {/* 끼니 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {MEAL_TYPES.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === i ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-purple-100'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* 입력 탭 */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab(-1)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === -1 ? 'bg-primary text-white' : 'bg-purple-50 text-gray-600'}`}>
            🔍 검색
          </button>
          <button onClick={() => setActiveTab(-2)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === -2 ? 'bg-primary text-white' : 'bg-purple-50 text-gray-600'}`}>
            📷 사진
          </button>
        </div>

        {activeTab !== -2 ? (
          <>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 border-2 border-purple-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="음식 이름 검색 (예: 비빔밥)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchFood()}
              />
              <input
                className="w-20 border-2 border-purple-100 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-primary"
                placeholder="양"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <button onClick={searchFood} disabled={loading || !search}
              className="w-full btn-primary py-2.5 text-sm">
              {loading ? '⚙️ AI가 분석 중...' : '🔍 AI로 분석하기'}
            </button>

            {result && (
              <div className="mt-4 p-4 bg-purple-50 rounded-2xl fade-up">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-800">{result.emoji} {result.name}</p>
                  <span className="text-primary font-bold">{result.calories}kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['단백질', result.protein, 'g'], ['탄수화물', result.carbs, 'g'], ['지방', result.fat, 'g']].map(([l, v, u]) => (
                    <div key={l} className="bg-white rounded-xl p-2 text-center">
                      <p className="text-sm font-bold text-gray-800">{v}{u}</p>
                      <p className="text-xs text-gray-400">{l}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => addToLog(result)} className="w-full btn-primary py-2 text-sm">기록에 추가 ✓</button>
              </div>
            )}
          </>
        ) : (
          <>
            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:bg-purple-50 transition-all">
              {imageFile ? (
                <img src={imageFile} alt="음식 사진" className="w-full h-40 object-cover rounded-xl" />
              ) : (
                <>
                  <span className="text-4xl">📷</span>
                  <p className="text-sm text-gray-500">사진을 찍거나 갤러리에서 선택</p>
                </>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            </label>
            {loading && <p className="text-center text-sm text-primary mt-3 animate-pulse">⚙️ AI가 음식을 인식 중...</p>}
            {imageResults.map((food, i) => (
              <div key={i} className="mt-3 p-3 bg-purple-50 rounded-2xl flex items-center justify-between fade-up">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{food.name}</p>
                  <p className="text-xs text-gray-500">{food.calories}kcal · 단백질 {food.protein}g</p>
                </div>
                <button onClick={() => addToLog({ ...food, emoji: '📷' })} className="btn-primary py-1.5 px-3 text-sm">추가</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 빠른 추가 */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-3">빠른 추가 ⚡</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_FOODS.map(f => (
            <button key={f.name} onClick={() => addToLog(f)}
              className="card p-3 flex items-center gap-2 active:scale-95 transition-transform text-left">
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-400">{f.calories}kcal</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 오늘 기록 목록 */}
      {todayMeals.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 mb-3">오늘 기록 ({todayMeals.length})</h3>
          <div className="flex flex-col gap-2">
            {todayMeals.map(m => (
              <div key={m.id} className="card p-3 flex items-center gap-3">
                <span className="text-2xl">{m.emoji || '🍱'}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.time} · {m.calories}kcal</p>
                </div>
                <button onClick={() => removeMeal(m.id)} className="text-red-300 hover:text-red-400 text-lg">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
