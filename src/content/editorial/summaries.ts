import type { EditorialSummary } from './types.js';

// 긴 상세 원고가 홈 bundle에 포함되지 않도록 게시 승인 시 별도 생성·검증합니다.
// Phase 5A 시작 시점에는 출처와 기준일을 모두 갖춘 공개 원고가 없습니다.
export const publishedEditorialSummaryIndex: EditorialSummary[] = [];
