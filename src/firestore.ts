import admin from "firebase-admin";

// 이미 초기화되었으면 재초기화 방지
if (!admin.apps.length) {
  admin.initializeApp({
    // Cloud Run/Functions에서는 기본 자격증명 사용
    // 로컬은 GOOGLE_APPLICATION_CREDENTIALS 또는 ADC를 이용
    // projectId: process.env.PROJECT_ID, // 필요시 명시
  });
}

export const db = admin.firestore();
