import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Download, ExternalLink } from 'lucide-react';
import { editorialInternalLink, type EditorialNavigate } from '../components/editorial/EditorialUi.js';
import type { DailyStockDissection } from '../content/editorial/types.js';
import { comparableReturns, evidenceTiming, loadPracticeCase, practiceCaseSummaries, practiceQuestions } from '../content/investment-thinking/practice.js';
import {
  appendJournalReview, factorLabel, judgmentCheckLabels, journalAsText, journalReviewLimit, journalStorageKey,
  journalTextLimit, judgmentFactors, readJournal, startJournal, writeJournal,
  type JudgmentFactor, type JournalReadResult, type PracticeJournal,
} from '../content/investment-thinking/journal.js';

const steps = ['내 판단', '근거 점검', '돌아보기'];
const shortDate = (value: string) => value.slice(0, 10).replace(/-/g, '.');
const recordDate = (value: string) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

function readLocal(item: DailyStockDissection): JournalReadResult {
  try { return readJournal(window.localStorage, item.id, item.priceAsOf); }
  catch { return { status: 'unavailable', record: null, raw: null }; }
}

function FactorChoices({ value, onChange, name }: { value: JudgmentFactor | ''; onChange: (value: JudgmentFactor) => void; name: string }) {
  return <fieldset className="thinking-practice-factors">
    <legend>어떤 요인이 중요해 보이나요?</legend>
    {judgmentFactors.map((factor) => <label key={factor.id}>
      <input type="radio" name={name} value={factor.id} checked={value === factor.id} required onChange={() => onChange(factor.id)} />
      <span><strong>{factor.label}</strong><small>{factor.description}</small></span>
    </label>)}
  </fieldset>;
}

function SourceList({ item, showInterpretation = false }: { item: DailyStockDissection; showInterpretation?: boolean }) {
  const evidence = (item.evidence ?? []).filter((entry) => showInterpretation || entry.factStatus !== 'editorialInterpretation');
  return <details className="thinking-lab-sources thinking-practice-sources">
    <summary>출처와 정보 시점 확인 · {evidence.length}개</summary>
    <p>발행 시각이 없는 자료는 날짜만 표시합니다. 사건과 가격의 분 단위 선후관계는 확정하지 않습니다.</p>
    <ol>{evidence.map((source) => {
      const timing = evidenceTiming(source, item.priceAsOf);
      return <li key={source.id} id={`practice-source-${source.id}`}>
        <div>
          <strong>{source.title ?? source.publisher ?? source.id}</strong>
          <span>{source.publisher} · {source.factStatus === 'official' ? '공식 자료' : source.factStatus === 'marketData' ? '시장 데이터' : source.factStatus === 'editorialInterpretation' ? '편집 해석' : '언론 보도'}</span>
          <span>{source.publishedAt ? `발행 ${source.publishedAt} · ${source.publishedAt.includes('T') ? '표기된 시간대 기준' : '발행 시각 미확인'}` : '발행일·시각 미확인'}{source.asOf ? ` / 자료 기준 ${source.asOf}` : ''}</span>
          <em className={`thinking-practice-timing timing-${timing}`}>{timing === 'later' ? '사례 기준일 이후 자료 · 당시 원인 근거에서 제외' : timing === 'unknown' ? '공개 시점 미확인 · 당시 이용 가능 여부 확인 필요' : '발행일이 사례 기준일 이내 · 장중 공개 시점은 별도 확인'}</em>
          {showInterpretation && source.note ? <small>{source.note}</small> : null}
        </div>
        {source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title ?? source.publisher ?? source.id} 원문 새 창에서 열기`}>원문 <ExternalLink size={14} aria-hidden="true" /></a> : null}
      </li>;
    })}</ol>
  </details>;
}

function EventMaterial({ item }: { item: DailyStockDissection }) {
  const comparisons = comparableReturns(item);
  return <>
    <div className="thinking-practice-basis">
      <span>과거 사례 · {item.company.ticker}</span>
      <dl><div><dt>사건 기준일</dt><dd>{shortDate(item.eventAsOf)}</dd></div><div><dt>가격 기준일</dt><dd>{shortDate(item.priceAsOf)}</dd></div><div><dt>원고 발행일</dt><dd>{shortDate(item.publishedAt)}</dd></div></dl>
      <p>이 날짜까지의 자료를 기준으로 살펴봅니다. 지금 남기는 기록은 당시의 사전 예측과 구분됩니다.</p>
    </div>
    <div className="thinking-practice-returns" aria-label="같은 거래일 가격 비교">
      {comparisons.map((entry) => <article key={entry.kind}>
        <span>{entry.kind === 'company' ? '기업' : entry.kind === 'market' ? '시장' : '업종'}</span><h2>{entry.name}</h2>
        <strong className={entry.value > 0 ? 'return-up' : entry.value < 0 ? 'return-down' : ''}>{entry.value > 0 ? '+' : ''}{entry.value.toFixed(entry.precision ?? 2)}%</strong>
        <small>{shortDate(entry.asOf)} · {entry.value > 0 ? '상승' : entry.value < 0 ? '하락' : '보합'}</small>
      </article>)}
    </div>
    <p className="thinking-practice-help">동일 거래일로 확인된 비교값만 표시합니다. 수익률 차이만으로 사건의 영향이나 원인을 확정할 수 없습니다.</p>
    <article className="thinking-lab-lead"><span>발표된 사건</span><p>{item.directCatalyst}</p><small>가격 기준: {item.priceMove.periodLabel}</small></article>
    <SourceList item={item} />
  </>;
}

function JournalHistory({ record }: { record: PracticeJournal }) {
  return <section className="thinking-practice-history" aria-labelledby="practice-history-title">
    <h2 id="practice-history-title">내 생각이 바뀐 과정</h2>
    <ol>
      <li><span>최초 판단 · 보존됨</span><time dateTime={record.initial.savedAt}>{recordDate(record.initial.savedAt)} 작성</time><h3>{factorLabel(record.initial.factor)}</h3><p>{record.initial.rationale}</p></li>
      {record.reviews.map((review, index) => <li key={`${review.savedAt}-${index}`}>
        <span>재검토 {index + 1} · {review.factor === (index ? record.reviews[index - 1].factor : record.initial.factor) ? '분류 유지' : '분류 수정'}</span>
        <time dateTime={review.savedAt}>{recordDate(review.savedAt)} 작성</time>
        <h3>{factorLabel(review.factor)}</h3><p>{review.rationale}</p>
        <dl><div><dt>확인한 근거</dt><dd>{review.evidence}</dd></div>{review.alternative ? <div><dt>다른 설명</dt><dd>{review.alternative}</dd></div> : null}{review.falsifier ? <div><dt>생각을 바꿀 신호</dt><dd>{review.falsifier}</dd></div> : null}{review.impact ? <div><dt>파급효과 가설 · 미확인</dt><dd>{review.impact}</dd></div> : null}{Object.entries(review.checks ?? {}).filter(([, text]) => text.trim()).map(([key, text]) => <div key={key}><dt>점검 메모 · {judgmentCheckLabels[key]}</dt><dd>{text}</dd></div>)}</dl>
      </li>)}
    </ol>
  </section>;
}

function PracticeSession({ item, slug, onNavigate }: { item: DailyStockDissection; slug: string; onNavigate: EditorialNavigate }) {
  const [loaded, setLoaded] = useState(() => readLocal(item));
  const record = loaded.record;
  const [step, setStep] = useState(record ? 2 : 0);
  const [factor, setFactor] = useState<JudgmentFactor | ''>('');
  const [rationale, setRationale] = useState('');
  const [reviewFactor, setReviewFactor] = useState<JudgmentFactor>((record?.reviews[record.reviews.length - 1] ?? record?.initial)?.factor ?? 'uncertain');
  const [reviewRationale, setReviewRationale] = useState('');
  const [evidence, setEvidence] = useState('');
  const [alternative, setAlternative] = useState('');
  const [falsifier, setFalsifier] = useState('');
  const [impact, setImpact] = useState('');
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checkNotes, setCheckNotes] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const initialInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== journalStorageKey(item.id) && event.key !== null) return;
      const next = readLocal(item);
      setLoaded(next);
      if (!next.record) setStep(0);
      setMessage('다른 탭의 저장 변경을 불러왔습니다. 작성 중인 입력은 유지됩니다.');
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, [item.id, item.priceAsOf]);

  const moveTo = (next: number) => {
    if (next < 0 || next > 2 || (next > 0 && !record)) return;
    setStep(next);
    setMessage('');
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const save = (next: PracticeJournal) => {
    let result: ReturnType<typeof writeJournal> = 'unavailable';
    try { result = writeJournal(window.localStorage, next, loaded.raw); } catch { /* browser storage may be disabled */ }
    if (result !== 'saved') {
      if (result === 'conflict') {
        const latest = readLocal(item);
        setLoaded(latest);
        if (!latest.record) setStep(0);
      }
      setMessage(result === 'conflict' ? '다른 탭에서 기록이 변경됐습니다. 최신 기록을 확인한 뒤 다시 저장하세요. 입력은 유지됩니다.' : '브라우저에 저장하지 못했습니다. 저장 공간·브라우저 설정을 확인한 뒤 다시 시도하세요. 입력은 유지됩니다.');
      return false;
    }
    setLoaded({ status: 'ready', record: next, raw: JSON.stringify(next) });
    return true;
  };

  const saveInitial = (event: FormEvent) => {
    event.preventDefault();
    if (!factor || loaded.status !== 'ready') return;
    if (!rationale.trim()) { setMessage('판단한 이유나 더 확인할 근거를 적어주세요.'); initialInputRef.current?.focus(); return; }
    if (!save(startJournal(item.id, item.priceAsOf, { factor, rationale, savedAt: new Date().toISOString() }))) return;
    setReviewFactor(factor);
    setStep(1);
    setMessage('최초 판단을 이 브라우저에 저장했습니다. 이제 다른 관점과 근거를 점검해 보세요.');
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const saveReview = (event: FormEvent) => {
    event.preventDefault();
    if (!record || record.reviews.length >= journalReviewLimit) return;
    if (!reviewRationale.trim() || !evidence.trim()) { setMessage('확인한 근거와 판단을 유지·수정한 이유를 적어주세요.'); return; }
    const lastTime = (record.reviews[record.reviews.length - 1] ?? record.initial).savedAt;
    const savedAt = new Date(Math.max(Date.now(), Date.parse(lastTime))).toISOString();
    if (!save(appendJournalReview(record, { factor: reviewFactor, rationale: reviewRationale, evidence, alternative, falsifier, impact, checks: { ...checkNotes }, savedAt }))) return;
    setReviewRationale(''); setEvidence(''); setAlternative(''); setFalsifier(''); setImpact(''); setCheckNotes({});
    setStep(2);
    setMessage('재검토를 저장했습니다. 최초 판단은 그대로 보존했습니다.');
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const download = (format: 'json' | 'txt') => {
    if (!record) return;
    const blob = new Blob([format === 'json' ? JSON.stringify(record, null, 2) : journalAsText(item.headline, record)], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `주가해부실-${slug}.${format}`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const deleteRecord = () => {
    try { window.localStorage.removeItem(journalStorageKey(item.id)); }
    catch { setMessage('기록을 지우지 못했습니다. 브라우저 설정을 확인하세요.'); return; }
    setLoaded({ status: 'ready', record: null, raw: null }); setFactor(''); setRationale(''); setReviewRationale(''); setEvidence(''); setAlternative(''); setFalsifier(''); setImpact(''); setCheckNotes({}); setConfirmDelete(false); setStep(0);
    setMessage('이 사례의 브라우저 기록을 지웠습니다.');
    window.requestAnimationFrame(() => initialInputRef.current?.focus());
  };

  return <>
    <section className="thinking-practice-storage" aria-label="기록 저장 안내">
      <strong>내 기록은 이 브라우저에 저장됩니다</strong><p>로그인·서버 전송 없이 기기와 브라우저별로 보관합니다. 시크릿 모드 종료나 사이트 데이터 삭제 시 사라질 수 있으니 파일로 내려받아 보관하세요. 입력은 저장 버튼을 눌렀을 때 보관하며, 점검 메모도 재검토와 함께 저장합니다.</p>
    </section>
    {loaded.status !== 'ready' ? <div className="thinking-practice-notice" role="alert"><p>{loaded.status === 'invalid' ? '저장된 기록의 형식을 읽지 못했습니다. 덮어쓰지 않았습니다. 기록을 초기화한 뒤 다시 시작할 수 있습니다.' : '브라우저 저장소를 읽지 못했습니다. 설정을 확인하고 다시 불러오세요.'}</p><button type="button" onClick={() => setLoaded(readLocal(item))}>저장 상태 다시 확인</button></div> : null}
    <article className="thinking-lab-story thinking-practice-story">
      <header className="thinking-lab-progress">
        <div><span>사건과 내 기록</span><strong>{step + 1} / 3</strong></div>
        <ol aria-label="기록 단계">{steps.map((label, index) => <li key={label}><button type="button" aria-current={step === index ? 'step' : undefined} disabled={index > 0 && !record} onClick={() => moveTo(index)}><span>{index + 1}</span><small>{label}</small></button></li>)}</ol>
      </header>
      <div className="thinking-lab-screen">
        <div className="thinking-lab-slide thinking-practice-slide">
          <div className="thinking-lab-slide-heading"><span>{step === 0 ? '사건과 배경' : step === 1 ? '확인할 근거' : '내 기록'} </span><h1 ref={headingRef} tabIndex={-1}>{step === 0 ? item.headline : step === 1 ? '내 설명에서 빠진 것은 무엇일까요?' : '무슨 근거로 생각을 고쳤나요?'}</h1><p>{step === 0 ? '어떤 요인이 영향을 줬을지, 확인한 근거와 함께 적어보세요.' : step === 1 ? '질문과 출처를 확인한 뒤 판단을 유지하거나 수정해 보세요.' : '처음의 생각과 이후의 근거를 나란히 볼 수 있습니다.'}</p></div>

          {step === 0 ? <>
            <EventMaterial item={item} />
            {record ? <section className="thinking-practice-saved-first"><h2>저장한 최초 판단</h2><strong>{factorLabel(record.initial.factor)}</strong><p>{record.initial.rationale}</p><small>최초 판단은 수정하지 않습니다. 새로운 생각은 재검토로 남길 수 있습니다.</small><button type="button" className="thinking-practice-primary" onClick={() => moveTo(1)}>근거 점검으로 이동 <ArrowRight size={16} aria-hidden="true" /></button></section> : <form onSubmit={saveInitial} className="thinking-practice-form">
              <FactorChoices name="initial-factor" value={factor} onChange={setFactor} />
              <label htmlFor="practice-initial-rationale">왜 그렇게 생각했나요?<textarea ref={initialInputRef} id="practice-initial-rationale" value={rationale} onChange={(event) => setRationale(event.target.value)} required maxLength={journalTextLimit} rows={5} placeholder="본 사실과 내 추측을 구분해 적어보세요. 판단하기 어렵다면 더 필요한 근거를 적어도 좋습니다." /></label>
              <button type="submit" className="thinking-practice-primary" disabled={loaded.status !== 'ready'}>최초 판단 저장하고 근거 점검 <ArrowRight size={16} aria-hidden="true" /></button>
            </form>}
          </> : null}

          {step === 1 && record ? <>
            <aside className="thinking-practice-saved-first"><span>내 최초 판단</span><strong>{factorLabel(record.initial.factor)}</strong><p>{record.initial.rationale}</p></aside>
            <section className="thinking-practice-questions" aria-labelledby="practice-questions-title"><h2 id="practice-questions-title">함께 확인할 질문</h2>{practiceQuestions.map((question) => <details key={question.id}><summary>{question.title}</summary><p>{question.prompt}</p><label htmlFor={`practice-question-${question.id}`}>{judgmentCheckLabels[question.id]} 점검 메모 · 선택<textarea id={`practice-question-${question.id}`} value={checkNotes[question.id] ?? ''} onChange={(event) => setCheckNotes({ ...checkNotes, [question.id]: event.target.value })} maxLength={journalTextLimit} rows={3} /></label></details>)}</section>
            <details className="thinking-practice-editorial"><summary>관련 해설 살펴보기</summary><div><h2>{item.industryFactors ? '시장 전체 요인' : '시장·산업 배경에 관한 해설'}</h2><ul>{item.marketWideFactors.map((fact) => <li key={fact}>{fact}</li>)}</ul>{item.industryFactors ? <><h2>산업 요인</h2><ul>{item.industryFactors.map((fact) => <li key={fact}>{fact}</li>)}</ul></> : null}<h2>{item.industryFactors ? '기업 개별 요인' : '기업에서 확인할 항목'}</h2><ul>{item.companySpecificFactors.map((fact) => <li key={fact}>{fact}</li>)}</ul><p><strong>편집 해석</strong> · {item.marketInterpretation}</p><h2>아직 확인되지 않은 내용</h2><ul>{item.unconfirmedItems.map((fact) => <li key={fact}>{fact}</li>)}</ul><p>원고 발행 {shortDate(item.publishedAt)} · 사후에 정리한 해설이며 요인별 기여도는 확정하지 않습니다.</p><a href={`/ko/insights/stock/${item.slug}`} onClick={editorialInternalLink(`/ko/insights/stock/${item.slug}`, onNavigate)}>전체 주가해부 읽기</a></div></details>
            <SourceList item={item} showInterpretation />
            {record.reviews.length < journalReviewLimit ? <form onSubmit={saveReview} className="thinking-practice-form">
              <h2>근거를 확인한 뒤의 내 판단</h2><p>분류를 유지해도 좋습니다. 무엇을 확인했고 왜 유지·수정했는지 적어보세요.</p>
              <FactorChoices name="review-factor" value={reviewFactor} onChange={setReviewFactor} />
              <label htmlFor="practice-review-evidence">확인한 근거와 그 시점<textarea id="practice-review-evidence" value={evidence} onChange={(event) => setEvidence(event.target.value)} maxLength={journalTextLimit} required rows={4} placeholder="자료명·날짜·확인한 내용을 적어보세요. 나중에 나온 자료라면 당시 정보와 구분하세요." /></label>
              <label htmlFor="practice-review-rationale">판단을 유지하거나 바꾼 이유<textarea id="practice-review-rationale" value={reviewRationale} onChange={(event) => setReviewRationale(event.target.value)} maxLength={journalTextLimit} required rows={4} /></label>
              <label htmlFor="practice-review-alternative">다른 가능한 설명 · 선택<textarea id="practice-review-alternative" value={alternative} onChange={(event) => setAlternative(event.target.value)} maxLength={journalTextLimit} rows={3} /></label>
              <label htmlFor="practice-review-falsifier">무엇을 확인하면 생각을 바꾸겠나요? · 선택<textarea id="practice-review-falsifier" value={falsifier} onChange={(event) => setFalsifier(event.target.value)} maxLength={journalTextLimit} rows={3} /></label>
              <label htmlFor="practice-review-impact">다른 기업에 미칠 영향 가설 · 선택<textarea id="practice-review-impact" value={impact} onChange={(event) => setImpact(event.target.value)} maxLength={journalTextLimit} rows={3} placeholder="공급업체·경쟁사·고객사 중 누구에게 어떤 영향이 가능할까요? 실제 관계와 계약은 별도로 확인하세요." /></label>
              <button type="submit" className="thinking-practice-primary">재검토 저장하고 돌아보기 <ArrowRight size={16} aria-hidden="true" /></button>
            </form> : <p>이 사례의 재검토 기록 50개를 모두 사용했습니다. 파일로 내려받아 보관할 수 있습니다.</p>}
          </> : null}

          {step === 2 && record ? <>
            <p className="thinking-practice-help">사례 가격 기준일 {shortDate(record.priceAsOf)} · 아래 시각은 내가 기록한 시각입니다. 판단 보류와 분류 유지는 모두 유효한 기록입니다.</p>
            <JournalHistory record={record} />
            {!record.reviews.length ? <p>아직 재검토가 없습니다. 근거 점검에서 확인한 내용과 수정 이유를 남겨보세요.</p> : null}
            <div className="thinking-practice-tools"><button type="button" onClick={() => download('txt')}><Download size={16} aria-hidden="true" /> 텍스트 내려받기</button><button type="button" onClick={() => download('json')}>JSON 내려받기</button></div>
            <button type="button" className="thinking-practice-primary" onClick={() => moveTo(1)}>다시 근거 점검하기 <ArrowRight size={16} aria-hidden="true" /></button>
          </> : null}
          <p className="thinking-practice-message" role="status" aria-live="polite">{message}</p>
        </div>
      </div>
      <footer className="thinking-lab-controls"><button type="button" onClick={() => moveTo(step - 1)} disabled={step === 0}><ArrowLeft size={16} aria-hidden="true" /> 이전</button><span>{steps[step]}</span><button type="button" onClick={() => moveTo(step + 1)} disabled={!record || step === 2}>다음 <ArrowRight size={16} aria-hidden="true" /></button></footer>
    </article>
    {record || loaded.status === 'invalid' ? <section className="thinking-practice-delete" aria-label="이 사례 기록 관리">
      {confirmDelete ? <><p>이 사례의 최초 판단과 재검토를 이 브라우저에서 모두 지울까요? 내려받은 파일은 남습니다.</p><button type="button" onClick={deleteRecord}>이 사례 기록 지우기</button><button type="button" onClick={() => { setConfirmDelete(false); window.requestAnimationFrame(() => deleteButtonRef.current?.focus()); }}>취소</button></> : <button ref={deleteButtonRef} type="button" onClick={() => setConfirmDelete(true)}>이 사례 기록 초기화</button>}
    </section> : null}
  </>;
}

export default function ThinkingPracticeRoute({ slug, navigation, onNavigate }: { slug: string; navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const [item, setItem] = useState<DailyStockDissection | null | undefined>(undefined);
  const [loadedSlug, setLoadedSlug] = useState('');
  useEffect(() => {
    let active = true;
    setItem(undefined);
    loadPracticeCase(slug).then((entry) => { if (active) { setItem(entry ?? null); setLoadedSlug(slug); } }).catch(() => { if (active) { setItem(null); setLoadedSlug(slug); } });
    return () => { active = false; };
  }, [slug]);
  return <div className="pick-shell thinking-lab-shell">
    {navigation}
    <main className="thinking-lab-main">
      <nav className="editorial-breadcrumb" aria-label="현재 위치"><a href="/ko/#thinking-lab" onClick={editorialInternalLink('/ko/#thinking-lab', onNavigate)}>사건 보기</a><span aria-hidden="true">/</span><strong>내 판단 기록</strong><a href="/ko/records" onClick={editorialInternalLink('/ko/records', onNavigate)}>내 기록 모아보기</a></nav>
      <nav className="thinking-practice-case-list" aria-label="사건 선택">{practiceCaseSummaries.map((entry) => <a key={entry.id} href={entry.path} aria-current={entry.slug === slug ? 'page' : undefined} onClick={editorialInternalLink(entry.path, onNavigate)}>{entry.company} <small>{shortDate(entry.date)}</small></a>)}</nav>
      {item === undefined || loadedSlug !== slug ? <section className="editorial-route-state" role="status"><h1>사건을 불러오는 중입니다.</h1></section> : item ? <PracticeSession key={`${item.id}:${item.priceAsOf}`} item={item} slug={slug} onNavigate={onNavigate} /> : <section className="editorial-route-state"><h1>공개된 사건을 찾을 수 없습니다.</h1><p>다른 사건을 선택해 주세요.</p></section>}
    </main>
  </div>;
}
