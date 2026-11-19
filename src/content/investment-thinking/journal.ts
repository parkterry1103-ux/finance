export const judgmentFactors = [
  { id: 'market', label: '시장 전체 요인', description: '금리·정책·시장 전반의 움직임' },
  { id: 'industry', label: '산업 요인', description: '같은 업종의 수요·비용·경쟁 변화' },
  { id: 'company', label: '기업 개별 요인', description: '실적·제품·계약 등 기업의 사건' },
  { id: 'mixed', label: '여러 요인이 함께', description: '하나의 설명으로 나누기 어려움' },
  { id: 'uncertain', label: '아직 판단하기 어려움', description: '더 확인할 근거가 필요함' },
] as const;

export type JudgmentFactor = typeof judgmentFactors[number]['id'];
export type JudgmentNote = { factor: JudgmentFactor; rationale: string; savedAt: string };
export type JudgmentReview = JudgmentNote & { evidence: string; alternative: string; falsifier: string; impact: string; checks?: Record<string, string> };
export const judgmentCheckLabels: Record<string, string> = { peers: '같은 업종 비교', timing: '사건과 가격의 선후관계', expectations: '이미 알려진 기대', alternative: '다른 설명', falsification: '생각을 바꿀 근거' };
export type PracticeJournal = {
  version: 1;
  caseId: string;
  priceAsOf: string;
  initial: JudgmentNote;
  reviews: JudgmentReview[];
};
export const journalTextLimit = 3000;
export const journalReviewLimit = 50;
const validFactor = (value: unknown): value is JudgmentFactor => judgmentFactors.some((factor) => factor.id === value);
const validText = (value: unknown, required = false): value is string => typeof value === 'string' && value.length <= journalTextLimit && (!required || value.trim().length > 0);
const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const validNote = (value: unknown): value is JudgmentNote => {
  if (!value || typeof value !== 'object') return false;
  const note = value as JudgmentNote;
  return validFactor(note.factor) && validText(note.rationale, true) && validDate(note.savedAt);
};

export function journalStorageKey(caseId: string) { return `stock-autopsy:thinking-journal:v1:${caseId}`; }
export function factorLabel(value: JudgmentFactor) { return judgmentFactors.find((factor) => factor.id === value)?.label ?? '아직 판단하기 어려움'; }

export function parseJournal(raw: string | null, caseId: string, priceAsOf: string): PracticeJournal | null {
  if (raw === null) return null;
  const value = JSON.parse(raw) as PracticeJournal;
  if (!value || value.version !== 1 || value.caseId !== caseId || value.priceAsOf !== priceAsOf || !validNote(value.initial)
    || !Array.isArray(value.reviews) || value.reviews.length > journalReviewLimit
    || value.reviews.some((review) => !validNote(review) || !validText(review.evidence, true) || !validText(review.alternative) || !validText(review.falsifier) || !validText(review.impact)
      || (review.checks !== undefined && (!review.checks || typeof review.checks !== 'object' || Array.isArray(review.checks) || Object.keys(review.checks).length > 5 || Object.entries(review.checks).some(([key, text]) => !Object.prototype.hasOwnProperty.call(judgmentCheckLabels, key) || !validText(text)))))) {
    throw new Error('invalid journal');
  }
  const times = [value.initial.savedAt, ...value.reviews.map((review) => review.savedAt)].map(Date.parse);
  if (times.some((time, index) => index > 0 && time < times[index - 1])) throw new Error('invalid journal sequence');
  return value;
}

// Pure operations keep the first response immutable and make review order testable.
export function startJournal(caseId: string, priceAsOf: string, note: JudgmentNote): PracticeJournal {
  const record: PracticeJournal = { version: 1, caseId, priceAsOf, initial: { ...note, rationale: note.rationale.trim() }, reviews: [] };
  return parseJournal(JSON.stringify(record), caseId, priceAsOf)!;
}

export function appendJournalReview(record: PracticeJournal, review: JudgmentReview): PracticeJournal {
  const next = { ...record, reviews: [...record.reviews, { ...review, rationale: review.rationale.trim(), evidence: review.evidence.trim() }] };
  return parseJournal(JSON.stringify(next), record.caseId, record.priceAsOf)!;
}

export type JournalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type JournalReadResult = { status: 'ready'; record: PracticeJournal | null; raw: string | null } | { status: 'invalid' | 'unavailable'; record: null; raw: null };
export function readJournal(storage: JournalStorage, caseId: string, priceAsOf: string): JournalReadResult {
  let raw: string | null;
  try { raw = storage.getItem(journalStorageKey(caseId)); } catch { return { status: 'unavailable', record: null, raw: null }; }
  try { return { status: 'ready', record: parseJournal(raw, caseId, priceAsOf), raw }; } catch { return { status: 'invalid', record: null, raw: null }; }
}

export function writeJournal(storage: JournalStorage, record: PracticeJournal, expectedRaw: string | null): 'saved' | 'conflict' | 'unavailable' {
  try {
    const key = journalStorageKey(record.caseId);
    if (storage.getItem(key) !== expectedRaw) return 'conflict';
    parseJournal(JSON.stringify(record), record.caseId, record.priceAsOf);
    storage.setItem(key, JSON.stringify(record));
    return 'saved';
  } catch { return 'unavailable'; }
}

export function journalAsText(title: string, record: PracticeJournal) {
  const noteText = (note: JudgmentNote) => `${note.savedAt}\n분류: ${factorLabel(note.factor)}\n생각: ${note.rationale}`;
  return [`주가해부실 · ${title}`, `사례 기준일: ${record.priceAsOf}`, '최초 판단', noteText(record.initial), ...record.reviews.map((review, index) => `재검토 ${index + 1}\n${noteText(review)}\n확인 근거: ${review.evidence}\n다른 설명: ${review.alternative}\n생각을 바꿀 신호: ${review.falsifier}\n다른 기업에 미칠 영향 가설: ${review.impact}\n${Object.entries(review.checks ?? {}).map(([key, text]) => `${judgmentCheckLabels[key]}: ${text}`).join('\n')}`)].join('\n\n');
}
