import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { ArrowRight, Download, Upload } from 'lucide-react';
import { editorialInternalLink, type EditorialNavigate } from '../components/editorial/EditorialUi.js';
import { factorLabel, type PracticeJournal } from '../content/investment-thinking/journal.js';
import { createNotebookBackup, filterNotebook, notebookBackupLimit, parseNotebookBackup, readNotebook, restoreNotebook, type NotebookSnapshot } from '../content/investment-thinking/notebook.js';
import { practiceCaseSummaries } from '../content/investment-thinking/practice.js';
import { publishedJournalById, publishedJournals } from '../content/investment-thinking/published.js';

const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const emptySnapshot: NotebookSnapshot = { entries: [], invalidCaseIds: [], unavailable: true };
function snapshot(): NotebookSnapshot {
  try { return readNotebook(window.localStorage); } catch { return emptySnapshot; }
}

type JournalRouteProps = { navigation: ReactNode; onNavigate: EditorialNavigate; entryId?: string };
const dayLabel = (value: string) => value.replace(/-/g, '.');

export default function JournalArchiveRoute(props: JournalRouteProps) {
  return props.entryId ? <PublishedJournalArticle {...props} entryId={props.entryId} /> : <JournalArchiveView {...props} />;
}

function PublishedJournalArticle({ navigation, onNavigate, entryId }: JournalRouteProps & { entryId: string }) {
  const entry = publishedJournalById(entryId);
  return <div className="pick-shell thinking-lab-shell">
    {navigation}
    <main className="thinking-lab-main published-journal-main">
      <a className="published-journal-back" href="/ko/records" onClick={editorialInternalLink('/ko/records', onNavigate)}>← 내 기록</a>
      {entry ? <article className="published-journal-article">
        <header>
          <span className="published-journal-eyebrow">공개한 복기 · {entry.company} · {entry.ticker}</span>
          <h1>{entry.title}</h1>
          <p className="published-journal-subtitle">{entry.subtitle}</p>
          <div className="published-journal-dates"><span>매수일 <time dateTime={entry.purchasedAt}>{dayLabel(entry.purchasedAt)}</time></span><span>복기 작성일 <time dateTime={entry.publishedAt}>{dayLabel(entry.publishedAt)}</time></span></div>
        </header>
        {entry.sections.map((section) => <section key={section.id} aria-labelledby={`journal-${section.id}`}>
          <h2 id={`journal-${section.id}`}>{section.title}</h2>
          {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {section.sourceIds?.map((id) => { const source = entry.sources.find((item) => item.id === id)!; return <a className="published-journal-source" key={id} href={source.url} target="_blank" rel="noopener noreferrer">출처: {source.title}{source.pages ? ` · ${source.pages}` : ''} ↗</a>; })}
        </section>)}
        <footer><h2>참고한 공식 자료</h2><ul>{entry.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}{source.pages ? ` · ${source.pages}` : ''} ↗</a><span>자료 공개일 {dayLabel(source.publishedAt)}</span></li>)}</ul><p>작성 시점의 개인적인 해석이며 투자 권유가 아닙니다. 이후의 시장 변화와 실적은 자동 반영되지 않습니다.</p></footer>
      </article> : <section className="journal-archive-empty"><h1>기록을 찾을 수 없습니다.</h1><a href="/ko/records" onClick={editorialInternalLink('/ko/records', onNavigate)}>내 기록으로 돌아가기</a></section>}
    </main>
  </div>;
}

function JournalArchiveView({ navigation, onNavigate }: JournalRouteProps) {
  const [notebook, setNotebook] = useState(snapshot);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'initial' | 'reviewed'>('all');
  const [pending, setPending] = useState<PracticeJournal[] | null>(null);
  const [message, setMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const [reading, setReading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const fileReadSequence = useRef(0);
  const entries = useMemo(() => filterNotebook(notebook.entries, query, filter), [notebook.entries, query, filter]);
  const pendingExisting = pending?.filter((record) => notebook.entries.some((entry) => entry.record.caseId === record.caseId) || notebook.invalidCaseIds.includes(record.caseId)).length ?? 0;

  useEffect(() => {
    const update = () => setNotebook(snapshot());
    const changed = (event: StorageEvent) => { if (event.key === null || event.key.startsWith('stock-autopsy:thinking-journal:v1:')) update(); };
    window.addEventListener('storage', changed);
    window.addEventListener('focus', update);
    return () => { window.removeEventListener('storage', changed); window.removeEventListener('focus', update); fileReadSequence.current += 1; };
  }, []);

  const exportAll = () => {
    const latest = snapshot(); setNotebook(latest);
    if (!latest.entries.length) { setMessage('내려받을 기록이 없습니다.'); return; }
    const backup = createNotebookBackup(latest.entries, new Date().toISOString());
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `주가해부실-내기록-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`저장된 기록 ${latest.entries.length}건의 백업 파일을 만들었습니다.`);
  };

  const chooseBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
    if (!file) return;
    const sequence = ++fileReadSequence.current;
    setPending(null); setFileError(''); setMessage(''); setReading(true);
    try {
      if (file.size > notebookBackupLimit) throw new Error('백업 파일은 16MB 이하만 불러올 수 있습니다.');
      const records = parseNotebookBackup(await file.text());
      if (sequence !== fileReadSequence.current) return;
      setNotebook(snapshot()); setPending(records);
      window.requestAnimationFrame(() => confirmRef.current?.focus());
    } catch (error) {
      if (sequence === fileReadSequence.current) setFileError(error instanceof Error ? error.message : '파일을 읽지 못했습니다.');
    } finally { if (sequence === fileReadSequence.current) setReading(false); }
  };

  const restore = () => {
    if (!pending) return;
    try {
      const result = restoreNotebook(window.localStorage, pending);
      setNotebook(snapshot()); setPending(null);
      setMessage(`${result.imported.length}건 복원 · 기존 기록 ${result.skipped.length}건 유지${result.failed.length ? ` · ${result.failed.length}건은 저장 공간 또는 브라우저 설정 때문에 복원하지 못했습니다. 백업 파일은 그대로 남아 있습니다.` : ''}`);
      window.requestAnimationFrame(() => importButtonRef.current?.focus());
    } catch { setFileError('기록을 복원하지 못했습니다. 브라우저 저장 설정을 확인해 주세요.'); }
  };

  return <div className="pick-shell thinking-lab-shell">
    {navigation}
    <main className="thinking-lab-main journal-archive-main">
      <header className="journal-archive-heading"><div><span>분석과 복기</span><h1>내 기록</h1><p>직접 투자하고 살펴본 기업, 판단의 근거와 남겨둔 질문입니다.</p></div></header>
      <section className="published-journal-list" aria-labelledby="published-journals-title">
        <h2 id="published-journals-title">공개한 복기</h2>
        {publishedJournals.map((entry) => <article key={entry.id}>
          <div className="journal-archive-card-meta"><span>{entry.company} · {entry.ticker}</span><time dateTime={entry.publishedAt}>{dayLabel(entry.publishedAt)} 작성</time></div>
          <h3><a href={entry.path} onClick={editorialInternalLink(entry.path, onNavigate)}>{entry.title}</a></h3>
          <p>{entry.summary}</p>
          <small>매수 {dayLabel(entry.purchasedAt)} · 사후 복기</small>
          <a className="published-journal-read" href={entry.path} onClick={editorialInternalLink(entry.path, onNavigate)}>복기 읽기 <ArrowRight size={16} aria-hidden="true" /></a>
        </article>)}
      </section>
      <section className="journal-private-heading" aria-labelledby="private-journals-title"><div><h2 id="private-journals-title">이 브라우저의 메모</h2><p>아래 메모는 공개 글과 별개로 이 기기에만 저장됩니다.</p></div><div className="journal-archive-actions"><button type="button" onClick={exportAll} disabled={!notebook.entries.length}><Download size={16} aria-hidden="true" /> 전체 백업</button><button ref={importButtonRef} type="button" onClick={() => uploadRef.current?.click()} disabled={reading}><Upload size={16} aria-hidden="true" /> {reading ? '파일 확인 중' : '백업 불러오기'}</button><input ref={uploadRef} type="file" accept=".json,application/json" hidden onChange={chooseBackup} aria-label="기록 백업 JSON 파일" /></div></section>
      <p className="journal-archive-storage">개인 메모는 서버로 전송되지 않습니다. 다른 기기에서는 백업 파일을 불러와 이어서 볼 수 있습니다.</p>
      {fileError ? <p className="journal-archive-error" role="alert">{fileError}</p> : null}
      <p className="journal-archive-status" role="status" aria-live="polite">{message}</p>
      {pending ? <section className="journal-archive-import" aria-labelledby="journal-import-title"><h2 id="journal-import-title">불러올 기록 확인</h2><p>{pending.length}건 중 {pending.length - pendingExisting}건을 추가할 수 있습니다. 이미 있는 기록은 수정하지 않고 건너뜁니다.</p><ul>{pending.map((record) => <li key={record.caseId}><strong>{practiceCaseSummaries.find((entry) => entry.id === record.caseId)?.company}</strong><span>가격 기준 {record.priceAsOf.replace(/-/g, '.')} · 최초 판단 + 재검토 {record.reviews.length}회</span></li>)}</ul><div><button ref={confirmRef} type="button" onClick={restore}>확인하고 복원</button><button type="button" onClick={() => { setPending(null); setMessage('복원을 취소했습니다. 저장된 기록은 그대로입니다.'); window.requestAnimationFrame(() => importButtonRef.current?.focus()); }}>취소</button></div></section> : null}
      {notebook.unavailable ? <section className="journal-archive-error" role="alert"><p>브라우저 저장소를 읽지 못했습니다. 저장 설정을 확인해 주세요.</p><button type="button" onClick={() => setNotebook(snapshot())}>다시 불러오기</button></section> : null}
      {notebook.invalidCaseIds.length ? <section className="journal-archive-warning" aria-label="확인이 필요한 기록"><h2>읽지 못한 기록 {notebook.invalidCaseIds.length}건</h2><p>손상되거나 기준일이 다른 기록은 덮어쓰지 않았습니다. 해당 사건에서 저장 상태를 확인할 수 있습니다.</p>{notebook.invalidCaseIds.map((id) => { const entry = practiceCaseSummaries.find((summary) => summary.id === id)!; return <a key={id} href={entry.path} onClick={editorialInternalLink(entry.path, onNavigate)}>{entry.company} 기록 확인 <ArrowRight size={14} aria-hidden="true" /></a>; })}</section> : null}

      {notebook.entries.length ? <>
        <section className="journal-archive-filters" aria-label="기록 찾기"><label htmlFor="journal-search">기업명·사건명 검색<input type="search" id="journal-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기업명 또는 종목코드" /></label><div role="group" aria-label="재검토 상태">{([['all', '전체'], ['initial', '재검토 전'], ['reviewed', '재검토 있음']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></section>
        <p className="journal-archive-count" role="status" aria-live="polite">{entries.length}건 · 최근 기록 순</p>
        {entries.length ? <div className="journal-archive-list">{entries.map(({ summary, record }) => {
          const latest = record.reviews[record.reviews.length - 1] ?? record.initial;
          return <article key={record.caseId}><div className="journal-archive-card-meta"><span>{summary.company} · {summary.ticker}</span><time dateTime={latest.savedAt}>{dateLabel(latest.savedAt)} 기록</time></div><h2>{summary.title}</h2><small>가격 기준 {record.priceAsOf.replace(/-/g, '.')} · 재검토 {record.reviews.length}회</small><dl><div><dt>최초 판단</dt><dd>{factorLabel(record.initial.factor)}</dd></div><div><dt>최근 판단</dt><dd>{factorLabel(latest.factor)}</dd></div></dl><p>{latest.rationale}</p><a href={summary.path} onClick={editorialInternalLink(summary.path, onNavigate)}>기록 이어서 보기 <ArrowRight size={16} aria-hidden="true" /></a></article>;
        })}</div> : <div className="journal-archive-empty"><h2>조건에 맞는 기록이 없습니다.</h2><button type="button" onClick={() => { setQuery(''); setFilter('all'); }}>검색·필터 초기화</button></div>}
      </> : !notebook.unavailable ? <section className="journal-archive-empty"><h2>아직 남긴 기록이 없습니다.</h2><p>사건을 살펴보고 첫 생각을 적어보세요.</p><a href={practiceCaseSummaries[0]?.path ?? '/ko/'} onClick={editorialInternalLink(practiceCaseSummaries[0]?.path ?? '/ko/', onNavigate)}>사건 살펴보기 <ArrowRight size={16} aria-hidden="true" /></a></section> : null}
    </main>
  </div>;
}
