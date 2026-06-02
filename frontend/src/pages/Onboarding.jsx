import { useState } from 'react';
import { useStore } from '../store';

const GOALS = [
  { id: 'diet', label: '다이어트 🔥', desc: '체중 감량' },
  { id: 'bulk', label: '벌크업 💪', desc: '근육 증가' },
  { id: 'maintain', label: '체중 유지 ⚖️', desc: '현재 유지' },
  { id: 'health', label: '건강 관리 🌿', desc: '전반적 건강' },
];

const ACTIVITY = [
  { id: 'sedentary', label: '거의 없음 🪑', multiplier: 1.2 },
  { id: 'light', label: '가벼운 운동 🚶', multiplier: 1.375 },
  { id: 'moderate', label: '보통 운동 🏃', multiplier: 1.55 },
  { id: 'active', label: '고강도 운동 🏋️', multiplier: 1.725 },
];

function calcCalories(age, gender, weight, height, activity, goal) {
  // Harris-Benedict
  const bmr = gender === '남성'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  const tdee = bmr * activity;
  if (goal === 'diet') return Math.round(tdee - 500);
  if (goal === 'bulk') return Math.round(tdee + 300);
  return Math.round(tdee);
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', gender: '남성', age: '', weight: '', height: '', goal: '', activity: '' });
  const { setProfile, setOnboardingDone } = useStore();

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const finish = () => {
    const actMultiplier = ACTIVITY.find(a => a.id === data.activity)?.multiplier || 1.55;
    const calorieGoal = calcCalories(+data.age, data.gender, +data.weight, +data.height, actMultiplier, data.goal);
    setProfile({ ...data, calorieGoal });
    setOnboardingDone();
  };

  const steps = [
    // Step 0: 환영
    <div key={0} className="flex flex-col items-center justify-center h-full text-center px-8 gap-6 fade-up">
      <div className="text-8xl">🥗</div>
      <h1 className="text-3xl font-bold text-gray-800">NutriAI에 오신 걸<br/>환영해요!</h1>
      <p className="text-gray-500 leading-relaxed">AI 개인 영양사가 맞춤 식단을<br/>분석하고 추천해 드려요.</p>
      <button className="btn-primary w-full mt-4" onClick={() => setStep(1)}>시작하기 →</button>
    </div>,

    // Step 1: 이름 + 성별
    <div key={1} className="flex flex-col gap-6 px-6 fade-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">안녕하세요! 👋</h2>
        <p className="text-gray-500 mt-1">이름과 성별을 알려주세요.</p>
      </div>
      <input
        className="w-full border-2 border-purple-100 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-primary"
        placeholder="이름을 입력하세요"
        value={data.name}
        onChange={e => update('name', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        {['남성', '여성'].map(g => (
          <button key={g} onClick={() => update('gender', g)}
            className={`py-4 rounded-2xl font-semibold text-lg transition-all ${data.gender === g ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-2 border-purple-100 text-gray-600'}`}>
            {g === '남성' ? '👨 남성' : '👩 여성'}
          </button>
        ))}
      </div>
      <button className="btn-primary" disabled={!data.name} onClick={() => setStep(2)}>다음 →</button>
    </div>,

    // Step 2: 신체 정보
    <div key={2} className="flex flex-col gap-6 px-6 fade-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">신체 정보 📏</h2>
        <p className="text-gray-500 mt-1">맞춤 칼로리 목표를 설정합니다.</p>
      </div>
      {[['나이', 'age', '세', 'number'], ['체중', 'weight', 'kg', 'number'], ['키', 'height', 'cm', 'number']].map(([label, key, unit, type]) => (
        <div key={key}>
          <label className="text-sm font-medium text-gray-600 mb-1 block">{label}</label>
          <div className="relative">
            <input
              type={type}
              className="w-full border-2 border-purple-100 rounded-2xl px-4 py-3 pr-12 text-lg focus:outline-none focus:border-primary"
              placeholder={`${label} 입력`}
              value={data[key]}
              onChange={e => update(key, e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{unit}</span>
          </div>
        </div>
      ))}
      <button className="btn-primary" disabled={!data.age || !data.weight || !data.height} onClick={() => setStep(3)}>다음 →</button>
    </div>,

    // Step 3: 목표
    <div key={3} className="flex flex-col gap-4 px-6 fade-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">목표를 선택해요 🎯</h2>
        <p className="text-gray-500 mt-1">어떤 목표를 이루고 싶으신가요?</p>
      </div>
      {GOALS.map(g => (
        <button key={g.id} onClick={() => update('goal', g.id)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${data.goal === g.id ? 'border-primary bg-primary/5' : 'border-purple-100 bg-white'}`}>
          <span className="text-2xl">{g.label.split(' ').pop()}</span>
          <div>
            <p className="font-semibold text-gray-800">{g.label.split(' ').slice(0, -1).join(' ')}</p>
            <p className="text-sm text-gray-500">{g.desc}</p>
          </div>
          {data.goal === g.id && <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">✓</div>}
        </button>
      ))}
      <button className="btn-primary mt-2" disabled={!data.goal} onClick={() => setStep(4)}>다음 →</button>
    </div>,

    // Step 4: 활동량
    <div key={4} className="flex flex-col gap-4 px-6 fade-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">활동 수준 🏃</h2>
        <p className="text-gray-500 mt-1">평소 운동량이 어떻게 되세요?</p>
      </div>
      {ACTIVITY.map(a => (
        <button key={a.id} onClick={() => update('activity', a.id)}
          className={`p-4 rounded-2xl border-2 transition-all text-left ${data.activity === a.id ? 'border-primary bg-primary/5' : 'border-purple-100 bg-white'}`}>
          <p className="font-semibold text-gray-800">{a.label}</p>
        </button>
      ))}
      <button className="btn-primary mt-2" disabled={!data.activity} onClick={finish}>완료! 시작하기 🎉</button>
    </div>,
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* 프로그레스 바 */}
      {step > 0 && (
        <div className="px-6 pt-8 pb-2">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-purple-100'}`} />
            ))}
          </div>
          {step > 0 && <button onClick={() => setStep(s => s-1)} className="text-gray-400 text-sm mt-4">← 이전</button>}
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center py-8">
        {steps[step]}
      </div>
    </div>
  );
}
