import { journalStorageKey, parseJournal, readJournal, writeJournal, type JournalStorage, type PracticeJournal } from './journal.js';
import { practiceCaseSummaries } from './practice.js';

export const notebookBackupLimit = 16 * 1024 * 1024;
export type NotebookEntry = { summary: typeof practiceCaseSummaries[number]; record: PracticeJournal };
export type NotebookSnapshot = { entries: NotebookEntry[]; invalidCaseIds: string[]; unavailable: boolean };
export type NotebookBackup = { format: 'stock-autopsy-journals'; version: 1; exportedAt: string; journals: PracticeJournal[] };

export function readNotebook(storage: JournalStorage): NotebookSnapshot {
  const entries: NotebookEntry[] = [];
  const invalidCaseIds: string[] = [];
  let unavailable = false;
  for (const summary of practiceCaseSummaries) {
    const result = readJournal(storage, summary.id, summary.date);
    if (result.status === 'invalid') invalidCaseIds.push(summary.id);
    if (result.status === 'unavailable') unavailable = true;
    if (result.record) entries.push({ summary, record: result.record });
  }
  entries.sort((left, right) => {
    const latest = (entry: NotebookEntry) => (entry.record.reviews[entry.record.reviews.length - 1] ?? entry.record.initial).savedAt;
    return Date.parse(latest(right)) - Date.parse(latest(left)) || left.summary.id.localeCompare(right.summary.id);
  });
  return { entries, invalidCaseIds, unavailable };
}

export function filterNotebook(entries: NotebookEntry[], query: string, status: 'all' | 'initial' | 'reviewed') {
  const term = query.trim().toLocaleLowerCase();
  return entries.filter(({ summary, record }) =>
    (!term || `${summary.company} ${summary.ticker ?? ''} ${summary.title}`.toLocaleLowerCase().includes(term))
    && (status === 'all' || (status === 'initial' ? record.reviews.length === 0 : record.reviews.length > 0)));
}

// Imported objects are normalized to known fields before storing them.
function cleanRecord(value: unknown): PracticeJournal {
  if (!value || typeof value !== 'object') throw new Error('기록 형식을 읽을 수 없습니다.');
  const candidate = value as PracticeJournal;
  const summary = practiceCaseSummaries.find((entry) => entry.id === candidate.caseId);
  if (!summary) throw new Error('현재 지원하지 않는 사건의 기록이 포함돼 있습니다.');
  let record: PracticeJournal | null;
  try { record = parseJournal(JSON.stringify(value), summary.id, summary.date); }
  catch { throw new Error('기록의 기준일·분류·작성 시각 또는 내용 형식이 올바르지 않습니다.'); }
  if (!record) throw new Error('빈 기록은 복원할 수 없습니다.');
  const note = (entry: PracticeJournal['initial']) => ({ factor: entry.factor, rationale: entry.rationale, savedAt: entry.savedAt });
  return {
    version: 1, caseId: record.caseId, priceAsOf: record.priceAsOf, initial: note(record.initial),
    reviews: record.reviews.map((review) => ({ ...note(review), evidence: review.evidence, alternative: review.alternative, falsifier: review.falsifier, impact: review.impact, ...(review.checks ? { checks: { ...review.checks } } : {}) })),
  };
}

export function parseNotebookBackup(text: string): PracticeJournal[] {
  if (new TextEncoder().encode(text).byteLength > notebookBackupLimit) throw new Error('백업 파일은 16MB 이하만 불러올 수 있습니다.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('JSON 파일을 읽을 수 없습니다. 주가해부실에서 내려받은 파일을 선택해 주세요.'); }
  let journals: unknown[];
  if (value && typeof value === 'object' && 'format' in value) {
    const backup = value as NotebookBackup;
    if (backup.format !== 'stock-autopsy-journals' || backup.version !== 1 || !Array.isArray(backup.journals)) throw new Error('지원하지 않는 백업 형식입니다.');
    journals = backup.journals;
  } else journals = [value]; // Also accepts the original per-case JSON download.
  if (!journals.length || journals.length > practiceCaseSummaries.length) throw new Error('백업의 사건 수가 올바르지 않습니다.');
  const records = journals.map(cleanRecord);
  if (new Set(records.map((record) => record.caseId)).size !== records.length) throw new Error('같은 사건의 기록이 중복돼 있습니다.');
  return records;
}

export function createNotebookBackup(entries: NotebookEntry[], exportedAt: string): NotebookBackup {
  return { format: 'stock-autopsy-journals', version: 1, exportedAt, journals: entries.map((entry) => cleanRecord(entry.record)) };
}

export function restoreNotebook(storage: JournalStorage, records: PracticeJournal[]) {
  const result = { imported: [] as string[], skipped: [] as string[], failed: [] as string[] };
  // Validate the complete input before performing any writes.
  const validated = parseNotebookBackup(JSON.stringify({ format: 'stock-autopsy-journals', version: 1, journals: records }));
  for (const record of validated) {
    try {
      if (storage.getItem(journalStorageKey(record.caseId)) !== null) { result.skipped.push(record.caseId); continue; }
      const outcome = writeJournal(storage, record, null);
      if (outcome === 'saved') result.imported.push(record.caseId);
      else if (outcome === 'conflict') result.skipped.push(record.caseId);
      else result.failed.push(record.caseId);
    } catch { result.failed.push(record.caseId); }
  }
  return result;
}
