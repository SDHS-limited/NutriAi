import { Router } from 'express';
import multer from 'multer';
import { ollamaChat, ollamaVision } from '../services/ollama.js';

export const nutritionRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// 음식 이름으로 영양소 분석
nutritionRouter.post('/analyze', async (req, res) => {
  try {
    const { foodName, amount } = req.body;
    const prompt = `"${foodName}" ${amount || '1인분'}의 영양 정보를 다음 JSON 형식으로만 반환하세요:
{"name":"${foodName}","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"fiber":숫자,"sodium":숫자,"serving":"${amount || '1인분'}"}
숫자는 정수, 단위 없이. JSON만 반환.`;

    const reply = await ollamaChat([{ role: 'user', content: prompt }]);
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('분석 실패');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '영양소 분석 실패' });
  }
});

// 이미지로 음식 인식 및 영양소 분석
nutritionRouter.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '이미지가 없습니다' });
    const base64 = req.file.buffer.toString('base64');

    const prompt = `이 음식 이미지를 분석하여 다음 JSON 배열 형식으로만 반환하세요.
음식이 여러 개라면 각각 분리하세요:
[{"name":"음식명","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"serving":"추정량"}]
JSON 배열만 반환, 다른 텍스트 없음.`;

    const reply = await ollamaVision(prompt, base64);
    const jsonMatch = reply.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('이미지 분석 실패');
    res.json({ foods: JSON.parse(jsonMatch[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '이미지 분석 실패', detail: err.message });
  }
});

// 바코드 식품 검색 (텍스트 기반 fallback)
nutritionRouter.post('/barcode', async (req, res) => {
  try {
    const { barcode } = req.body;
    const prompt = `바코드 ${barcode}에 해당하는 한국 식품의 영양 정보를 알고 있다면 JSON으로, 모른다면 {"error":"unknown"} 반환:
{"name":"제품명","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"serving":"1회 제공량"}`;

    const reply = await ollamaChat([{ role: 'user', content: prompt }]);
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('바코드 분석 실패');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    res.status(500).json({ error: '바코드 분석 실패' });
  }
});
