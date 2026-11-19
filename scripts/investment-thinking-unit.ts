import { investmentCase } from '../src/content/investment-thinking/cases/pilot-001.js';
import { appendJournalReview, journalAsText, journalStorageKey, parseJournal, readJournal, startJournal, writeJournal, type JudgmentReview } from '../src/content/investment-thinking/journal.js';
import { comparableReturns, evidenceTiming, loadPracticeCase, practiceCaseSummaries } from '../src/content/investment-thinking/practice.js';
import { createNotebookBackup, filterNotebook, notebookBackupLimit, parseNotebookBackup, readNotebook, restoreNotebook } from '../src/content/investment-thinking/notebook.js';
import { publishedJournalById, publishedJournals } from '../src/content/investment-thinking/published.js';
import {
  investmentCaseStepForKey,
  investmentCaseSummaries,
  investmentHypotheses,
  investmentRules,
  nextInvestmentCaseStep,
  previousInvestmentCaseStep,
  validateInvestmentThinkingRegistry,
} from '../src/content/investment-thinking/index.js';

let checks = 0;
function check(condition: unknown, message: string) {
  checks += 1;
  if (!condition) throw new Error(`Investment Thinking validation failed: ${message}`);
}

check(validateInvestmentThinkingRegistry([investmentCase]).length === 0, 'registry must validate');
check(investmentRules.length === 5, 'Rulebook v0.1 must contain five rules');
check(investmentRules.every((rule) => rule.editable && rule.status === 'current'), 'rules must remain editable current principles');
check(investmentHypotheses.length === 1 && investmentHypotheses[0].id === 'KR-THEME-001', 'pilot hypothesis must exist');
check(investmentHypotheses[0].status === 'testing', 'hypothesis must be testing');
check(investmentHypotheses[0].scopeNote.includes('전체의 법칙이 아니라'), 'hypothesis must have a narrow scope note');
check(investmentCase.eventSourceStatus === 'editorial-input', 'event must keep its source boundary');
check(investmentCase.subjects.map((subject) => subject.name).join('|') === '제주반도체|어보브반도체|넥스트칩', 'pilot subject order must be stable');
check(investmentCase.subjects.every((subject) => subject.sourceIds.length > 0), 'each subject must have an official source');
check(investmentCase.falsificationSignals.length === 5, 'pilot must record five falsification signals');
check(investmentCase.hypothesisIds.includes('KR-THEME-001'), 'pilot must link the testing hypothesis');
check(investmentCase.ruleIds.includes('RULE-005'), 'pilot must link the falsification rule');
check(investmentCaseSummaries.length === 1 && investmentCaseSummaries[0].path === '/ko/lab/cases/pilot-001', 'home summary path must be canonical');
check(nextInvestmentCaseStep(0) === 1 && nextInvestmentCaseStep(1) === 2, 'next advances');
check(nextInvestmentCaseStep(2) === 2, 'next stops at the final screen');
check(previousInvestmentCaseStep(2) === 1 && previousInvestmentCaseStep(1) === 0, 'previous goes back');
check(previousInvestmentCaseStep(0) === 0, 'previous stops at the first screen');
check(investmentCaseStepForKey(0, 'ArrowRight') === 1, 'ArrowRight advances');
check(investmentCaseStepForKey(2, 'ArrowLeft') === 1, 'ArrowLeft goes back');
check(investmentCaseStepForKey(1, 'Home') === 0 && investmentCaseStepForKey(1, 'End') === 2, 'Home and End move to boundaries');
check(investmentCaseStepForKey(1, 'Enter') === 1, 'unrelated keys do not change screens');

const initialNote = { factor: 'uncertain' as const, rationale: '  업종과 기업 발표를 더 비교해야 한다.  ', savedAt: '2026-11-06T01:00:00Z' };
const first = startJournal('test-case', '2026-07-24', initialNote);
const review: JudgmentReview = { factor: 'mixed', rationale: '업종과 기업 요인을 함께 보기로 했다.', evidence: '같은 거래일 업종 자료를 확인했다.', alternative: '기대 조정일 수 있다.', falsifier: '후속 공식 실적 확인', impact: '경쟁사 영향은 미확인 가설', savedAt: '2026-11-06T02:00:00Z' };
const second = appendJournalReview(first, review);
check(first.reviews.length === 0 && first.initial.rationale === initialNote.rationale.trim(), 'append must not mutate original journal');
check(second.initial.rationale === first.initial.rationale && second.reviews.length === 1, 'first judgment must survive review');
check(parseJournal(JSON.stringify(second), 'test-case', '2026-07-24')?.reviews[0].evidence === review.evidence, 'reload must preserve review evidence');
check(parseJournal(null, 'test-case', '2026-07-24') === null, 'missing storage must be empty');
function rejects(callback: () => unknown) { try { callback(); return false; } catch { return true; } }
check(rejects(() => parseJournal('{bad', 'test-case', '2026-07-24')), 'malformed JSON must not be accepted');
check(rejects(() => parseJournal(JSON.stringify(second), 'different-case', '2026-07-24')), 'case records must not cross cases');
check(rejects(() => parseJournal(JSON.stringify(second), 'test-case', '2026-07-25')), 'changed price basis must not silently reuse a record');
check(rejects(() => startJournal('test-case', '2026-07-24', { ...initialNote, rationale: ' ' })), 'empty rationale must be rejected');
check(rejects(() => appendJournalReview(first, { ...review, evidence: '' })), 'review must cite checked evidence');
check(rejects(() => appendJournalReview(first, { ...review, savedAt: '2026-11-05T01:00:00Z' })), 'review cannot precede first judgment');
check(rejects(() => appendJournalReview(first, { ...review, checks: { unknown: '잘못된 질문' } })), 'unknown question keys cannot enter stored records');
check(appendJournalReview(first, { ...review, checks: { peers: '업종 확인' } }).reviews[0].checks?.peers === '업종 확인', 'question answers must survive saving');
check(rejects(() => parseJournal(JSON.stringify({ ...second, version: 2 }), 'test-case', '2026-07-24')), 'unknown storage version must be rejected');
check(rejects(() => parseJournal(JSON.stringify({ ...second, reviews: Array(51).fill(review) }), 'test-case', '2026-07-24')), 'storage growth must be bounded');
const values = new Map<string, string>();
const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
check(writeJournal(storage, first, null) === 'saved', 'first save must succeed');
check(writeJournal(storage, second, null) === 'conflict', 'stale tab must not overwrite latest record');
check(readJournal(storage, 'test-case', '2026-07-24').record?.initial.factor === 'uncertain', 'conflict must preserve saved original');
check(writeJournal(storage, second, JSON.stringify(first)) === 'saved', 'fresh expected storage can append review');
values.set(journalStorageKey('test-case'), 'broken');
check(readJournal(storage, 'test-case', '2026-07-24').status === 'invalid', 'corrupt storage must be surfaced');
const blockedStorage = { ...storage, getItem: () => { throw new Error('blocked'); } };
check(readJournal(blockedStorage, 'test-case', '2026-07-24').status === 'unavailable', 'blocked storage must be surfaced');
check(writeJournal({ ...storage, setItem: () => { throw new Error('quota'); } }, first, 'broken') === 'unavailable', 'quota error cannot report saved');
check(journalAsText('테스트', second).includes(review.evidence) && journalAsText('테스트', second).includes(first.initial.rationale), 'export must contain first and revised reasoning');
check(evidenceTiming({ id: 'a', type: 'news', factStatus: 'mediaReported', publishedAt: '2026-07-25' }, '2026-07-24') === 'later', 'later news must be marked after cutoff');
check(evidenceTiming({ id: 'a', type: 'price', factStatus: 'marketData', asOf: '2026-07-24' }, '2026-07-24') === 'unknown', 'asOf must not be confused with publication time');
check(evidenceTiming({ id: 'a', type: 'news', factStatus: 'mediaReported', publishedAt: '2026-07-23' }, '2026-07-24') === 'by-cutoff', 'prior publication date must be recognizable');
check(practiceCaseSummaries.length === 4 && new Set(practiceCaseSummaries.map((entry) => entry.slug)).size === 4, 'latest Intel and three preserved published cases should be selectable');
check(practiceCaseSummaries[0].date === '2026-11-05', 'home entry must use latest Intel price session');
check(practiceCaseSummaries.some((entry) => entry.id === 'stock-2026-07-25-intel-earnings-capex-reversal' && entry.date === '2026-07-24'), 'old Intel journal identity and date must be preserved');
for (const summary of practiceCaseSummaries) {
  const item = await loadPracticeCase(summary.slug);
  check(['ownerVerified', 'sourceVerified'].includes(item?.verification?.status ?? '') && item?.status === 'published', `${summary.slug} must retain reviewed source material`);
  check(comparableReturns(item!).every((entry) => entry.asOf === item!.priceAsOf), 'comparison dates must match');
}
const practice = (await loadPracticeCase(practiceCaseSummaries[0].slug))!;
const mismatched = { ...practice, comparison: { market: { name: 'Wrong day', value: 1, asOf: '2020-01-01', sourceId: 'fixture' } } };
check(comparableReturns(mismatched).length === 1, 'different-day benchmark must not appear in comparison');
check(await loadPracticeCase('practice-paypal-control-premium-draft') === undefined, 'draft must not become a practice case');

const notebookStoreValues = new Map<string, string>();
const notebookStore = { getItem: (key: string) => notebookStoreValues.get(key) ?? null, setItem: (key: string, value: string) => { notebookStoreValues.set(key, value); }, removeItem: (key: string) => { notebookStoreValues.delete(key); } };
const firstSummary = practiceCaseSummaries[0];
const otherSummary = practiceCaseSummaries[1];
const firstRecord = startJournal(firstSummary.id, firstSummary.date, initialNote);
const otherRecord = startJournal(otherSummary.id, otherSummary.date, { ...initialNote, factor: 'industry', savedAt: '2026-11-06T03:00:00Z' });
writeJournal(notebookStore, firstRecord, null);
writeJournal(notebookStore, otherRecord, null);
const notebook = readNotebook(notebookStore);
check(notebook.entries[0].record.caseId === otherSummary.id, 'notebook must sort by recording time instead of price date');
check(filterNotebook(notebook.entries, `  ${firstSummary.ticker?.toLowerCase()}  `, 'all').length === 2, 'notebook ticker search must find both Intel dates, ignoring case and whitespace');
check(notebook.entries.some(({ record }) => record.priceAsOf === '2026-07-24') && notebook.entries.some(({ record }) => record.priceAsOf === '2026-11-05'), 'new and old Intel journals must coexist without replacing the old basis');
check(filterNotebook(notebook.entries, '', 'initial').length === 2 && filterNotebook(notebook.entries, '', 'reviewed').length === 0, 'notebook review filter must reflect stored reviews');
check(filterNotebook(notebook.entries, 'no-such-company', 'all').length === 0, 'notebook search must support empty results');
const backup = createNotebookBackup(notebook.entries, '2026-11-06T04:00:00Z');
check(parseNotebookBackup(JSON.stringify(backup)).length === 2, 'aggregate backup must round-trip');
check(parseNotebookBackup(JSON.stringify(firstRecord))[0].caseId === firstSummary.id, 'legacy per-case JSON must be restorable');
check(!('unexpected' in parseNotebookBackup(JSON.stringify({ ...firstRecord, unexpected: 'drop me' }))[0]), 'import must normalize unknown fields');
check(rejects(() => parseNotebookBackup('{bad')), 'malformed backup must be rejected');
check(rejects(() => parseNotebookBackup(JSON.stringify({ ...backup, version: 99 }))), 'unknown backup version must be rejected');
check(rejects(() => parseNotebookBackup(JSON.stringify({ ...backup, journals: [firstRecord, firstRecord] }))), 'duplicate cases in backup must be rejected');
check(rejects(() => parseNotebookBackup(JSON.stringify({ ...firstRecord, caseId: 'unsupported' }))), 'unsupported case must be rejected');
check(rejects(() => parseNotebookBackup(JSON.stringify({ ...firstRecord, priceAsOf: '2000-01-01' }))), 'incorrect backup price basis must be rejected');
check(rejects(() => parseNotebookBackup(' '.repeat(notebookBackupLimit + 1))), 'oversized backup must be rejected');
const restoreValues = new Map<string, string>();
const restoreStore = { getItem: (key: string) => restoreValues.get(key) ?? null, setItem: (key: string, value: string) => { restoreValues.set(key, value); }, removeItem: (key: string) => { restoreValues.delete(key); } };
const restored = restoreNotebook(restoreStore, backup.journals);
check(restored.imported.length === 2 && readNotebook(restoreStore).entries.length === 2, 'backup restore must populate a fresh browser');
check(restoreNotebook(restoreStore, backup.journals).skipped.length === 2, 'second restore must preserve existing records');
const beforeRestore = restoreValues.get(journalStorageKey(firstSummary.id));
restoreNotebook(restoreStore, [appendJournalReview(firstRecord, review)]);
check(restoreValues.get(journalStorageKey(firstSummary.id)) === beforeRestore, 'imported longer history must not overwrite existing original');
restoreValues.set(journalStorageKey(firstSummary.id), '{broken');
check(restoreNotebook(restoreStore, [firstRecord]).skipped.length === 1 && restoreValues.get(journalStorageKey(firstSummary.id)) === '{broken', 'corrupt existing record must not be silently replaced');
check(readNotebook(restoreStore).invalidCaseIds.includes(firstSummary.id), 'archive must surface unreadable records');
check(readNotebook({ ...restoreStore, getItem: () => { throw new Error('blocked'); } }).unavailable, 'archive must distinguish blocked storage from empty archive');
const failedRestore = restoreNotebook({ ...storage, getItem: () => null, setItem: () => { throw new Error('quota'); } }, backup.journals);
check(failedRestore.failed.length === 2 && failedRestore.imported.length === 0, 'restore failure counts must be honest');
check(rejects(() => restoreNotebook(restoreStore, [otherRecord, { ...firstRecord, caseId: 'invalid' }])), 'restore must validate all records before writes');

check(publishedJournals.length === 1, 'one owner-approved public review must be published');
check(new Set(publishedJournals.map((entry) => entry.id)).size === publishedJournals.length, 'public review IDs must be unique');
for (const entry of publishedJournals) {
  check(entry.path === `/ko/records/${entry.id}`, 'public review must have a stable records permalink');
  check(entry.publishedAt > entry.purchasedAt, 'review publication must not be backdated to the purchase');
  check(entry.sections.length === 5 && entry.sections.every((section) => section.paragraphs.length > 0), 'approved review must retain all five complete sections');
  check(entry.sections.every((section) => (section.sourceIds ?? []).every((id) => entry.sources.some((source) => source.id === id))), 'public review source references must resolve');
  check(entry.sources.every((source) => new URL(source.url).hostname === 'www.koreanre.co.kr'), 'review citations must point to official primary sources');
  check(!practiceCaseSummaries.some((summary) => summary.id === entry.id), 'public review must remain separate from private journal storage');
}
check(publishedJournalById('2026-11-19-korean-re-review')?.ticker === '003690', 'Korean Re review must be addressable');
check(publishedJournalById('2026-11-19-korean-re-review')?.sections[0].paragraphs[0].includes('코스피가 고점권에 와 있다고 판단해'), 'purchase motivation must remain the owner’s contemporaneous judgment, not an objective market-high claim');
check(publishedJournalById('2026-11-19-korean-re-review')?.sections[0].paragraphs[0].includes('주식 비중을 줄이고 있었다'), 'review must retain the owner-confirmed defensive portfolio context');
check(publishedJournalById('missing') === undefined, 'unknown public review must not fall back to another article');

console.log(`Investment Thinking Lab validation passed (${checks} checks, ${investmentRules.length} rules, ${practiceCaseSummaries.length} practice cases).`);
