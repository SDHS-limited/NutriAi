import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './routes/ai.js';
import { nutritionRouter } from './routes/nutrition.js';
import { mealsRouter } from './routes/meals.js';
import { imageRouter } from './routes/image.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use('/api/image', imageRouter);

// Routes
app.use('/api/ai', aiRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/image', imageRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const r = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/tags`);
    const data = await r.json();
    res.json({
      status: 'ok',
      ollama: 'connected',
      models: data.models?.map(m => m.name) || []
    });
  } catch {
    res.status(503).json({ status: 'ok', ollama: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ NutriAI 백엔드 실행 중: http://localhost:${PORT}`);
  console.log(`🤖 Ollama 주소: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log(`📦 모델: ${process.env.OLLAMA_MODEL || 'gemma3:4b'}`);
});
