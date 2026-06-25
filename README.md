#  NutriAI – AI 개인 영양사 (VSCode 풀스택)

APK 앱을 VSCode 로컬 개발 환경으로 이식한 **React + Express + Ollama** 풀스택 프로젝트입니다.

##  프로젝트 구조

```
nutriai/
├── frontend/          # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/     # Home, MealLog, Analysis, Chat, Profile
│       ├── components/ # Layout (바텀 탭 네비게이션)
│       ├── store/     # Zustand 전역 상태
│       └── api/       # 백엔드 API 클라이언트
│
└── backend/           # Express.js API 서버
    └── src/
        ├── routes/    # ai.js, nutrition.js, meals.js
        └── services/  # ollama.js (Ollama LLM 연동)
```

##  시작하기

### 1. Ollama 설치 및 모델 다운로드
```bash
# Ollama 설치: https://ollama.com
ollama pull gemma3:4b          # 텍스트 AI (영양 분석, 채팅, 추천)
ollama pull llava:7b           # 이미지 AI (음식 사진 인식) - 선택사항
ollama serve                   # Ollama 서버 실행
```

### 2. 백엔드 설정
```bash
cd backend
npm install
cp .env.example .env           # 환경변수 설정
npm run dev                    # http://localhost:3001
```

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

##  환경변수 (.env)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | 3001 | 백엔드 포트 |
| `OLLAMA_BASE_URL` | http://localhost:11434 | Ollama 주소 |
| `OLLAMA_MODEL` | gemma3:4b | 텍스트 모델 |
| `OLLAMA_VISION_MODEL` | llava:7b | 이미지 분석 모델 |

##  주요 기능

| 기능 | 설명 |
|------|------|
| 🏠 **홈** | 오늘 칼로리 진행상황, AI 다음 끼니 추천 |
| 📝 **식단 기록** | 텍스트 검색 또는 사진으로 음식 AI 분석 후 기록 |
| 📊 **분석** | 주간 칼로리/영양소 차트, AI 주간 인사이트 |
| 💬 **AI 상담** | 로컬 Ollama와 자유 채팅 (식단 컨텍스트 자동 포함) |
| 👤 **프로필** | 신체 정보, 목표, 알레르기 관리 |

##  API 엔드포인트

```
GET  /api/health                    # Ollama 연결 상태 확인
POST /api/ai/chat                   # AI 채팅
POST /api/ai/recommend-meal         # 다음 끼니 추천 (JSON)
POST /api/ai/weekly-insight         # 주간 인사이트 (JSON)
POST /api/nutrition/analyze         # 음식명 → 영양소 분석
POST /api/nutrition/analyze-image   # 사진 → 음식 인식 (llava 필요)
GET  /api/meals/:date               # 날짜별 식사 조회
POST /api/meals                     # 식사 추가
DELETE /api/meals/:id               # 식사 삭제
GET  /api/meals/weekly/summary      # 주간 통계
```

##  모델 선택 가이드
| 모델 | 크기 | 특징 |
|------|------|------|
| `gemma3:4b` | ~3GB | 빠르고 한국어 우수, 권장 |
| `llama3.2:3b` | ~2GB | 가볍고 빠름 |
| `qwen2.5:7b` | ~5GB | 더 정확한 분석 |
| `llava:7b` | ~5GB | 이미지 분석용 (Vision) |

##  데이터 저장

- **프론트엔드**: Zustand + localStorage (온보딩, 채팅, 식사 기록)
- **백엔드**: 인메모리 (서버 재시작 시 초기화)
- 실제 서비스 배포 시 SQLite 또는 PostgreSQL로 교체 권장
