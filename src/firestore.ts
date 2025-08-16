// src/firestore.ts
import { Firestore } from "@google-cloud/firestore";

// 환경변수로 명시 (없으면 기본값 사용)
const projectId = process.env.PROJECT_ID || "scsc-ai";
const databaseId = process.env.FIRESTORE_DATABASE_ID || "scsc-ai";

// 명시적으로 Firestore 인스턴스 생성
export const db = new Firestore({
  projectId,
  databaseId,   // ← 만약 비기본 DB를 만들었다면 여기 이름을 넣으세요
});

// 필요 시: undefined 필드 무시
// db.settings({ ignoreUndefinedProperties: true });
