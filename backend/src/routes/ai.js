import { Router } from 'express';
import { ollamaChat, ollamaStream } from '../services/ollama.js';

export const aiRouter = Router();

const SYSTEM_PROMPT = `당신은 NutriAI의 전문 AI 영양사입니다. 
- 사용자의 식단, 칼로리, 영양소 균형에 대해 친근하고 전문적인 조언을 제공합니다.
- 한국어로 답변하며, 이모지를 적절히 사용하세요.
- 구체적인 수치와 근거를 바탕으로 조언하세요.
- 의료적 진단은 하지 않으며, 전문 의사 상담을 권유하세요.`;

// 일반 채팅
aiRouter.post('/chat', async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    const systemWithProfile = userProfile
      ? `${SYSTEM_PROMPT}\n\n[사용자 정보]\n나이: ${userProfile.age}세, 성별: ${userProfile.gender}, 목표: ${userProfile.goal}, 일일 칼로리 목표: ${userProfile.calorieGoal}kcal`
      : SYSTEM_PROMPT;

    const ollamaMessages = [
      { role: 'system', content: systemWithProfile },
      ...messages
    ];
    const reply = await ollamaChat(ollamaMessages);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI 응답 실패', detail: err.message });
  }
});

// 스트리밍 채팅
aiRouter.post('/chat/stream', async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    const systemWithProfile = userProfile
      ? `${SYSTEM_PROMPT}\n\n[사용자 정보]\n나이: ${userProfile.age}세, 성별: ${userProfile.gender}, 목표: ${userProfile.goal}, 일일 칼로리 목표: ${userProfile.calorieGoal}kcal`
      : SYSTEM_PROMPT;

    const ollamaMessages = [
      { role: 'system', content: systemWithProfile },
      ...messages
    ];
    await ollamaStream(ollamaMessages, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI 스트리밍 실패' });
  }
});

// 다음 끼니 추천
aiRouter.post('/recommend-meal', async (req, res) => {
  try {
    const { todayMeals, remainingCalories, userProfile, mealType } = req.body;
    const mealsText = todayMeals?.length
      ? todayMeals.map(m => `${m.name}(${m.calories}kcal, 단백질${m.protein}g, 탄수화물${m.carbs}g, 지방${m.fat}g)`).join(', ')
      : '아직 없음';

    const prompt = `오늘 먹은 식사: ${mealsText}
남은 칼로리: ${remainingCalories}kcal
사용자 목표: ${userProfile?.goal || '건강 유지'}
다음 끼니 종류: ${mealType || '저녁'}

위 정보를 바탕으로 다음 끼니 메뉴 3가지를 JSON 배열로만 추천해주세요.
형식: [{"name":"메뉴명","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"reason":"추천이유"}]
JSON 외 다른 텍스트 없이 배열만 반환하세요.`;

    const reply = await ollamaChat([{ role: 'user', content: prompt }]);
    const jsonMatch = reply.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('JSON 파싱 실패');
    res.json({ recommendations: JSON.parse(jsonMatch[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '추천 실패', detail: err.message });
  }
});

// 주간 인사이트
aiRouter.post('/weekly-insight', async (req, res) => {
  try {
    const { weeklyData, userProfile } = req.body;
    const prompt = `다음은 사용자의 지난 7일 식단 데이터입니다:
${JSON.stringify(weeklyData, null, 2)}

사용자 목표: ${userProfile?.goal || '건강 유지'}
일일 칼로리 목표: ${userProfile?.calorieGoal || 2000}kcal

이 데이터를 분석하여 다음 JSON 형식으로만 답하세요:
{
  "summary": "전체 요약 2문장",
  "strengths": ["잘한 점 2가지"],
  "improvements": ["개선할 점 2가지"],
  "nextWeekTip": "다음 주 핵심 실천 팁 1가지",
  "score": 0~100점 숫자
}`;

    const reply = await ollamaChat([{ role: 'user', content: prompt }]);
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON 파싱 실패');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '인사이트 생성 실패' });
  }
});
