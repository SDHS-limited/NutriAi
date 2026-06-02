import { useState } from 'react';
import { useStore } from '../store';

const GOAL_LABELS = { diet: '다이어트 🔥', bulk: '벌크업 💪', maintain: '체중 유지 ⚖️', health: '건강 관리 🌿' };
const ACTIVITY_LABELS = { sedentary: '거의 없음 🪑', light: '가벼운 운동 🚶', moderate: '보통 운동 🏃', active: '고강도 운동 🏋️' };

export default function Profile() {
  const { profile, setProfile, mealHistory } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile || {});

  const totalDays = Object.keys(mealHistory).length;
  const totalMeals = Object.values(mealHistory).reduce((a, m) => a + m.length, 0);
  const avgCalories = totalDays > 0
    ? Math.round(Object.values(mealHistory).reduce((a, meals) => a + meals.reduce((b, m) => b + (m.calories || 0), 0), 0) / totalDays)
    : 0;

  const save = () => {
    setProfile(form);
    setEditing(false);
  };

  const Field = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-purple-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );

  return (
    <div className="px-4">
      <div className="pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">내 프로필 👤</h1>
        <button onClick={() => editing ? save() : setEditing(true)}
          className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${editing ? 'bg-primary text-white' : 'bg-purple-50 text-primary'}`}>
          {editing ? '저장' : '수정'}
        </button>
      </div>

      {/* 아바타 카드 */}
      <div className="hero-gradient rounded-3xl p-6 text-white mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl">
          {profile?.gender === '여성' ? '👩' : '👨'}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile?.name}님</h2>
          <p className="text-white/80 text-sm">{GOAL_LABELS[profile?.goal] || '목표 미설정'}</p>
          <p className="text-white/60 text-xs mt-0.5">일일 목표: {profile?.calorieGoal?.toLocaleString()}kcal</p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '기록 일수', value: totalDays, unit: '일' },
          { label: '총 끼니', value: totalMeals, unit: '끼' },
          { label: '평균 칼로리', value: avgCalories, unit: 'kcal' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className="text-xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 프로필 정보 */}
      <div className="card p-4 mb-4">
        <h3 className="font-bold text-gray-800 mb-2">기본 정보</h3>
        {editing ? (
          <div className="space-y-3">
            {[['이름', 'name', 'text'], ['나이', 'age', 'number'], ['체중(kg)', 'weight', 'number'], ['키(cm)', 'height', 'number']].map(([l, k, t]) => (
              <div key={k}>
                <label className="text-xs text-gray-500 mb-1 block">{l}</label>
                <input type={t} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full border-2 border-purple-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Field label="이름" value={profile?.name} />
            <Field label="성별" value={profile?.gender} />
            <Field label="나이" value={`${profile?.age}세`} />
            <Field label="체중" value={`${profile?.weight}kg`} />
            <Field label="키" value={`${profile?.height}cm`} />
            <Field label="활동 수준" value={ACTIVITY_LABELS[profile?.activity] || '-'} />
            <Field label="목표" value={GOAL_LABELS[profile?.goal] || '-'} />
          </>
        )}
      </div>

      {/* 알레르기 정보 */}
      <div className="card p-4 mb-4">
        <h3 className="font-bold text-gray-800 mb-3">알레르기 정보 🚫</h3>
        <div className="flex flex-wrap gap-2">
          {['글루텐', '유제품', '견과류', '달걀', '갑각류', '생선', '대두(콩)', '돼지고기'].map(a => (
            <button key={a}
              onClick={() => {
                if (!editing) return;
                const current = form.allergies || [];
                setForm(f => ({ ...f, allergies: current.includes(a) ? current.filter(x => x !== a) : [...current, a] }));
              }}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                (editing ? form : profile)?.allergies?.includes(a)
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-500'
              } ${editing ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}>
              {a}
            </button>
          ))}
        </div>
        {!editing && <p className="text-xs text-gray-400 mt-2">프로필 수정에서 변경 가능합니다</p>}
      </div>

      {/* Ollama 설정 안내 */}
      <div className="card p-4 mb-8 bg-purple-50 border-purple-100">
        <h3 className="font-bold text-gray-800 mb-2">⚙️ AI 설정 (Ollama)</h3>
        <div className="space-y-1 text-xs text-gray-600">
          <p>• 백엔드의 <code className="bg-purple-100 px-1 rounded">.env</code> 파일에서 모델 설정</p>
          <p>• 텍스트: <code className="bg-purple-100 px-1 rounded">OLLAMA_MODEL=gemma3:4b</code></p>
          <p>• 이미지: <code className="bg-purple-100 px-1 rounded">OLLAMA_VISION_MODEL=llava:7b</code></p>
          <p className="mt-2">모델 다운로드: <code className="bg-purple-100 px-1 rounded">ollama pull gemma3:4b</code></p>
        </div>
      </div>
    </div>
  );
}
