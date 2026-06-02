const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llava:7b';

export async function ollamaChat(messages, stream = false) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, stream }),
  });
  if (!res.ok) throw new Error(`Ollama 오류: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

export async function ollamaVision(prompt, imageBase64) {
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL,
      prompt,
      images: [imageBase64],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama Vision 오류: ${res.status}`);
  const data = await res.json();
  return data.response || '';
}

export async function ollamaStream(messages, res) {
  const upstream = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, stream: true }),
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        const token = json.message?.content || '';
        if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
        if (json.done) res.write('data: [DONE]\n\n');
      } catch {}
    }
  }
  res.end();
}
