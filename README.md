# SCSC AI Project - YouTube Top 10

YouTube Top 10 인기 동영상을 실시간으로 보여주는 풀스택 웹 애플리케이션입니다.

## 🏗️ 프로젝트 구조

```
scsc-ai-project/
├── src/                    # 백엔드 서버 (Node.js + Express + TypeScript)
│   ├── server.ts          # 메인 서버 파일
│   └── firestore.ts       # Firestore 데이터베이스 연결
├── client/                 # 프론트엔드 (React + TypeScript + Tailwind CSS)
│   ├── src/               # React 소스 코드
│   ├── public/            # 정적 파일
│   └── package.json       # 프론트엔드 의존성
├── docs/                  # 문서
└── package.json           # 백엔드 의존성
```

## 🚀 실행 방법

### 1. 백엔드 서버 실행

```bash
# 프로젝트 루트에서
npm install          # 백엔드 의존성 설치
npm run dev          # 개발 모드로 서버 실행 (포트 8080)
```

### 2. 프론트엔드 실행

```bash
# 새 터미널에서
cd client
npm install          # 프론트엔드 의존성 설치
npm start            # React 개발 서버 실행 (포트 3000)
```

## 🌐 API 엔드포인트

- `GET /api/health` - 서버 상태 확인
- `GET /api/regions` - 사용 가능한 지역 목록
- `GET /api/snapshots/latest?region=KR` - 특정 지역의 최신 스냅샷
- `GET /api/snapshots/KR/2024-01-15` - 특정 날짜의 스냅샷
- `GET /api/snapshots?region=KR&limit=10` - 지역별 스냅샷 목록

## 🛠️ 기술 스택

### 백엔드
- Node.js + Express
- TypeScript
- Firebase Firestore
- CORS, Helmet, Compression, Morgan

### 프론트엔드
- React 18
- TypeScript
- Tailwind CSS
- Axios (HTTP 클라이언트)

## 📱 주요 기능

- 🌍 지역별 YouTube Top 10 동영상 표시
- 📊 실시간 데이터 업데이트
- 📱 반응형 디자인
- 🔄 자동 새로고침
- 🎨 모던한 UI/UX

## 🔧 개발 환경 설정

1. Node.js 16+ 설치
2. 프로젝트 클론
3. 백엔드 의존성 설치: `npm install`
4. 프론트엔드 의존성 설치: `cd client && npm install`
5. 환경 변수 설정 (필요시)
6. 서버 실행: `npm run dev`
7. 클라이언트 실행: `cd client && npm start`

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
